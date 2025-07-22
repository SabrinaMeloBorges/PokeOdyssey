import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from 'src/app/services/audio.service';
import { AuthService } from 'src/app/services/auth.service';
import { take } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-capturar',
  templateUrl: './capturar.component.html',
  styleUrls: ['./capturar.component.css']
})
export class CapturarComponent implements OnInit, OnDestroy {
  menuActive = false;
  isMobile = window.innerWidth < 768;
  isPlaying = false;
  private audioFile = 'assets/audio/Battle! Pokemon.mp3';
  isAdmin: boolean = false;

  links: any[] = [];
  pokemonsDisponiveis: any[] = [];
  pokemonAtual: any;

  mensagemCaptura: string | null = null;

  pokebolaGirando = false;
  pokebolaExplodindo = false;

  audioCaptura = new Audio('assets/audio/catching-pokemon.mp3');
  audioFuga = new Audio('assets/audio/PokemonFled.mp3');

  allLinks = [
    { name: 'Menu', path: '/menu' },
    { name: 'Usuários', path: '/usuarios', adminOnly: true },
    { name: 'Pokémons', path: '/pokemons' },
    { name: 'Registrar Pokémons', path: '/cadastro', adminOnly: true },
    { name: 'Pokédex', path: '/pokedex' },
    { name: 'Capturar', path: '/capturar' },
  ];

  constructor(
    private router: Router,
    private audioService: AudioService,
    private authService: AuthService,
    private firestore: AngularFirestore,
    private snackBar: MatSnackBar
  ) {
    this.audioCaptura.volume = 0.4;
    this.audioFuga.volume = 0.4;
  }

  ngOnInit(): void {
    this.checkAdminStatus();
    this.playMusic();
    this.getPokemonsFromFirebase();
  }

  ngOnDestroy(): void {
    this.stopMusic();
  }

  checkAdminStatus(): void {
    this.authService.isAdmin().pipe(take(1)).subscribe(isAdmin => {
      this.isAdmin = isAdmin;
      this.links = this.allLinks.filter(link => !link.adminOnly || this.isAdmin);
    });
  }

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  toggleMusic() {
    this.isPlaying ? this.stopMusic() : this.playMusic();
  }

  playMusic() {
    if (!this.isPlaying) {
      this.audioService.playMusic(this.audioFile);
      this.isPlaying = true;
    }
  }

  stopMusic() {
    if (this.isPlaying) {
      this.audioService.stopMusic();
      this.isPlaying = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.menuActive = false;
    }
  }

  getLinkAnimation(index: number): string {
    return this.menuActive ? `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s` : '';
  }

  getPokemonsFromFirebase() {
    this.firestore.collection('pokemons').valueChanges({ idField: 'id' }).subscribe((pokemons: any[]) => {
      this.pokemonsDisponiveis = pokemons.map(pokemon => ({
        id: pokemon.id,
        nome: pokemon.name,
        tipo: Array.isArray(pokemon.types) ? pokemon.types.join(' / ') : pokemon.types,
        tipos: Array.isArray(pokemon.types) ? pokemon.types : [pokemon.types], // Para exibição com cor
        imagem: pokemon.imageUrl,
        capturado: false,
        chanceCaptura: pokemon.captureRate || 50
      }));
      this.sortearPokemon();
    });
  }

  sortearPokemon() {
    if (this.pokemonsDisponiveis.length > 0) {
      this.pokemonAtual = this.pokemonsDisponiveis[
        Math.floor(Math.random() * this.pokemonsDisponiveis.length)
      ];
    } else {
      this.pokemonAtual = null;
    }
  }
  

  async capturarPokemon(pokemonId: string) {
    const pokemon = this.pokemonsDisponiveis.find(p => p.id === pokemonId);
    if (!pokemon || pokemon.capturado) return;
  
    this.pokebolaGirando = true;
    this.mensagemCaptura = null;
  
    setTimeout(async () => {
      this.pokebolaGirando = false;
  
      const chance = Math.random() * 100;
  
      if (chance <= pokemon.chanceCaptura) {
        this.audioCaptura.currentTime = 0;
        this.audioCaptura.play();
  
        this.pokebolaExplodindo = true;
        setTimeout(() => {
          this.pokebolaExplodindo = false;
        }, 800);
  
        const user = await this.authService.getCurrentUser();
        const userId = user && user.uid;
  
        if (userId) {
          const pokemonData = {
            numero: parseInt(pokemon.id),
            nome: pokemon.nome,
            tipo: pokemon.tipo,
            poder: Math.floor(Math.random() * 1000) + 1,
            dataCaptura: new Date()
          };
  
          await this.firestore.collection(`usuarios/${userId}/pokemonsCapturados`).add(pokemonData);
        }
  
        this.mensagemCaptura = `${pokemon.nome} foi capturado!`;
      } else {
        this.audioFuga.currentTime = 0;
        this.audioFuga.play();
        this.mensagemCaptura = `${pokemon.nome} fugiu!`;
      }
  
      setTimeout(() => {
        this.mensagemCaptura = null;
        this.sortearPokemon();
      }, 2500);
    }, 2500);
  }
  
}
