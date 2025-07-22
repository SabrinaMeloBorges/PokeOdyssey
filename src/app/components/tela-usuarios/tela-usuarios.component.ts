import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-tela-usuarios',
  templateUrl: './tela-usuarios.component.html',
  styleUrls: ['./tela-usuarios.component.scss']
})
export class TelaUsuariosComponent implements OnInit {
  users: User[] = [];
  loading = true;
  menuActive = false;
  isMobile = window.innerWidth < 768;
  error: string | null = null;
  isAdmin = false;

  selectedUser: User | null = null;
  showPokemonModal = false;

  links = [
    { name: 'Menu', path: '/menu' },
    { name: 'Usuários', path: '/usuarios' },
    { name: 'Pokémons', path: '/pokemons' },
    { name: 'Registrar Pokémons', path: '/cadastro' },
    { name: 'Pokédex', path: '/pokedex' },
  ];

  constructor(
    private router: Router,
    private userService: UserService,
    private firestore: AngularFirestore,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.checkAdminStatus();
    this.loadUsers();
  }

  async checkAdminStatus() {
    const uid = this.authService.getCurrentUserUid();
    if (!uid) return;

    const docRef = this.firestore.collection('users').doc(uid);
    const snapshot = await docRef.get().toPromise();

    const data = snapshot && (snapshot.data() as any);
    this.isAdmin = data && data.role === 'admin';
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;
  
    this.userService.getUsers().subscribe({
      next: async (users) => {
        this.users = await Promise.all(users.map(async user => {
          const pokemonsRef = this.firestore.collection(`users/${user.uid}/pokemonsCapturados`);
          const snapshot = await pokemonsRef.get().toPromise();
          const quantidadePokemons = snapshot.size; // A contagem dos Pokémons é feita diretamente aqui
  
          return {
            ...user,
            displayName: user.displayName,
            pokemonsCount: quantidadePokemons
          };
        }));
  
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar usuários';
        this.loading = false;
        console.error(err);
      }
    });
  }
    
  

  onRoleChange(user: User, event: Event): void {
    if (!this.isAdmin || !user.uid) return;

    const select = event.target as HTMLSelectElement;
    const newRole = select.value as 'hunter' | 'admin';
    const originalRole = user.role;

    user.role = newRole;

    this.userService.updateUser({ uid: user.uid, role: newRole })
      .catch(error => {
        console.error('Erro ao atualizar:', error);
        user.role = originalRole;
        select.value = originalRole;
        this.error = 'Falha ao atualizar perfil';
      });
  }

  viewPokemons(user: any) {
    const userId = user.uid;
  
    this.firestore.collection('usuarios').doc(userId).collection('pokemonsCapturados').get().subscribe(snapshot => {
      const pokemons: any[] = [];
  
      snapshot.forEach(doc => {
        const data = doc.data();
  
        const nome = data.nome || 'Desconhecido';
        const imagem = data.imagem || 'assets/imagem_padrao.png';
        const poder = data.poder || 0;
  
        let dataCaptura: Date;
        if (data.dataCaptura && typeof data.dataCaptura.toDate === 'function') {
          dataCaptura = data.dataCaptura.toDate();
        } else {
          dataCaptura = new Date();
        }
  
        pokemons.push({
          nome,
          imagem,
          poder,
          dataCaptura
        });
      });
  
      this.selectedUser = {
        ...user,
        capturedPokemons: pokemons
      };
  
      this.showPokemonModal = true;
    }, error => {
      console.error('Erro ao buscar Pokémons capturados:', error);
    });
  }
  
  
  closeModal(): void {
    this.showPokemonModal = false;
    this.selectedUser = null;
  }

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) this.menuActive = false;
  }

  navigateToMenu() {
    this.router.navigate(['/menu']);
  }

  getLinkAnimation(index: number): string {
    return this.menuActive ? `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s` : '';
  }
}
