import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pokemons',
  templateUrl: './pokemons.component.html',
  styleUrls: ['./pokemons.component.scss']
})
export class PokemonsComponent implements OnInit, OnDestroy {
  menuActive = false;
  userRole: string;
  isMobile = window.innerWidth < 768;
  currentUser: Partial<User> | null = null;
  isHunter = false;
  isAdmin = false;
  pokemons: any[] = [];
  pokemonsFiltrados: any[] = [];
  filtroSelecionado = 'recentes';
  cooldownMap: { [key: string]: number } = {};
  cooldownInterval: any;
  audio = new Audio('assets/audio/pokemon-tcg.mp3');
  allLinks = [
    { name: 'Menu', path: '/menu' },
    { name: 'Usuários', path: '/usuarios', adminOnly: true },
    { name: 'Pokémons', path: '/pokemons' },
    { name: 'Registrar Pokémons', path: '/cadastro', adminOnly: true },
    { name: 'Pokédex', path: '/pokedex' },
    { name: 'Capturar', path: '/capturar', hunterOnly: true },
    { name: 'Sobre', path: '/sobre' }
  ];
  visibleLinks: any[] = [];

  constructor(
    private authService: AuthService,
    private firestore: AngularFirestore
  ) {}

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      const userDocRef = this.firestore.collection('usuarios').doc(user.uid);
      const userDoc = await userDocRef.get().toPromise();

      let role: 'admin' | 'hunter' = 'hunter';
      if (userDoc && userDoc.data()) {
        const userData: any = userDoc.data();
        if (userData.role === 'admin') {
          role = 'admin';
        }
      }

      this.currentUser = {
        uid: user.uid,
        displayName: user.displayName,
        role
      };

      this.isAdmin = this.currentUser.role === 'admin';
      this.isHunter = this.currentUser.role === 'hunter';

      this.loadPokemons();
      this.filterVisibleLinks();
    }

    this.cooldownInterval = setInterval(() => this.atualizarCooldowns(), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.cooldownInterval);
  }

  addPokemon(pokemon: any) {
    return this.firestore.collection('pokemons').add(pokemon);
  }

  filterVisibleLinks() {
    this.visibleLinks = this.allLinks.filter(link => {
      if (link.adminOnly && !this.isAdmin) return false;
      if (link.hunterOnly && !this.isHunter) return false;
      return true;
    });
  }

  loadPokemons() {
    if (!this.currentUser) return;

    const isAdmin = this.currentUser.role === 'admin';
    const userId = this.currentUser.uid;

    if (isAdmin) {
      this.firestore.collection('pokemons', ref =>
        ref.where('cadastradoPor', '==', userId).orderBy('createdAt', 'desc')
      ).valueChanges({ idField: 'id' }).subscribe(pokemons => {
        this.pokemons = pokemons.map(p => this.prepararPokemon(p));
        this.aplicarFiltro();
      });
    } else {
      this.firestore.collection(`usuarios/${userId}/pokemonsCapturados`)
        .valueChanges({ idField: 'id' }).subscribe(pokemons => {
          console.log('Pokémons capturados encontrados:', pokemons);
          this.pokemons = pokemons.map(p => this.prepararPokemon(p, true));
          this.aplicarFiltro();
        });
    }
  }

  prepararPokemon(data: any, capturado: boolean = false) {
    if (!data) {
      console.error('Dados de Pokémon estão indefinidos:', data);
      return;
    }

    const nome = data.nome || 'Desconhecido';
    const poder = data.poder || 0;
    const tipo = data.tipo || 'Desconhecido';
    const numero = data.numero || 1;

    const tipoTraduzido: { [key: string]: string } = {
      grama: 'grass', fogo: 'fire', água: 'water', elétrico: 'electric',
      eletrico: 'electric', gelo: 'ice', lutador: 'fighting', veneno: 'poison',
      terra: 'ground', voador: 'flying', psíquico: 'psychic', inseto: 'bug',
      pedra: 'rock', fantasma: 'ghost', dragão: 'dragon', noturno: 'dark',
      aço: 'steel', fada: 'fairy', normal: 'normal'
    };

    const tiposFormatados = Array.isArray(tipo)
      ? tipo
      : tipo.split('/').map(t =>
          tipoTraduzido[t.trim().toLowerCase()] || t.trim().toLowerCase()
        );

    const imagemUrl = `http://localhost:3000/pokemons/${numero}/imagem`;

    let dataCaptura = new Date();
    if (data.dataCaptura && typeof data.dataCaptura.toDate === 'function') {
      dataCaptura = data.dataCaptura.toDate();
    } else if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      dataCaptura = data.createdAt.toDate();
    }

    return {
      ...data,
      nome,
      poder,
      tipo: tiposFormatados,
      imagem: imagemUrl,
      dataCaptura,
      cooldownRemaining: 0,
      showReadyIcon: false
    };
  }
  fortalecerPokemon(pokemon: any) {
    if (!this.currentUser || pokemon.cooldownRemaining > 0) return;
  
    const cooldownDuration = 30 * 1000;
    const now = Date.now();
    const cooldownEndsAt = now + cooldownDuration;
  
    pokemon.cooldownEndsAt = cooldownEndsAt;
    pokemon.cooldownRemaining = cooldownDuration;
    pokemon.showReadyIcon = false;
  
    this.audio.play();
  
    const userId = this.currentUser.uid;
    const pokemonRef = this.firestore
      .collection(`usuarios/${userId}/pokemonsCapturados`)
      .doc(pokemon.id);
  
    pokemonRef.update({ cooldownEndsAt }).then(() => {
      setTimeout(() => {
        pokemon.showReadyIcon = true;
      }, cooldownDuration);
    }).catch(err => {
      console.error('Erro ao atualizar cooldown:', err);
    });
  }
  
  aplicarFiltro(): void {
    switch (this.filtroSelecionado) {
      case 'fortes':
        this.pokemonsFiltrados = [...this.pokemons].sort((a, b) => b.poder - a.poder);
        break;
      case 'nome':
        this.pokemonsFiltrados = [...this.pokemons].sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'recentes':
      default:
        this.pokemonsFiltrados = [...this.pokemons].sort((a, b) => b.dataCaptura.getTime() - a.dataCaptura.getTime());
    }
  }

  atualizarCooldowns() {
    const now = Date.now();
    this.pokemons.forEach(pokemon => {
      const cooldownEndsAt = pokemon.cooldownEndsAt || 0;
      const remaining = cooldownEndsAt - now;
      pokemon.cooldownRemaining = remaining > 0 ? remaining : 0;
    });
  }

  soltarPokemon(pokemon: any) {
    if (!this.currentUser) return;

    Swal.fire({
      title: `Soltar ${pokemon.nome}?`,
      text: "Você não poderá desfazer isso!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, soltar!',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.firestore.collection(`usuarios/${this.currentUser!.uid}/pokemonsCapturados`).doc(pokemon.id).delete()
          .then(() => {
            this.pokemons = this.pokemons.filter(p => p.id !== pokemon.id);
            this.aplicarFiltro();
            Swal.fire('Solto!', `${pokemon.nome} foi solto com sucesso.`, 'success');
          })
          .catch(error => {
            console.error('Erro ao soltar Pokémon:', error);
            Swal.fire('Erro', 'Não foi possível soltar o Pokémon.', 'error');
          });
      }
    });
  }

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  getProximoCooldown(pokemon: any): number {
    return pokemon.cooldownRemaining || 0;
  }

  onFiltroChange(filtro: string) {
    this.filtroSelecionado = filtro;
    this.aplicarFiltro();
  }
}
