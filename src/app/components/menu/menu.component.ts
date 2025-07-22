import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  providers: [DatePipe]
})
export class MenuComponent implements OnInit {
  userName: string = '';
  lastLogin: string = '';
  currentTime: string = '';
  menuActive = false;
  isMobile = window.innerWidth < 768;
  userRole: string = 'hunter';

  allLinks = [
    { name: 'Menu', path: '/menu' },
    { name: 'Usuários', path: '/usuarios', adminOnly: true },
    { name: 'Pokémons', path: '/pokemons' },
    { name: 'Registrar Pokémons', path: '/cadastro', adminOnly: true },
    { name: 'Pokédex', path: '/pokedex' },
    { name: 'Capturar', path: '/capturar', hunterOnly: true },
  ];

  constructor(
    public authService: AuthService,
    private firestore: AngularFirestore,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.authService.user$.pipe(
      take(1)
    ).subscribe(() => {
      this.loadUserData();
    });

    this.updateCurrentTime();
    setInterval(() => this.updateCurrentTime(), 60000);
  }

  async loadUserData() {
    const user = this.authService.getCurrentUser();

    if (!user || !user.uid) {
      console.warn('🚫 Nenhum usuário autenticado.');
      this.userName = '';
      this.userRole = 'hunter';
      this.lastLogin = '';
      return;
    }

    const userDoc = await this.firestore.collection('users').doc(user.uid).get().toPromise();

    if (userDoc && userDoc.exists) {
      const userData = userDoc.data() as any;

      console.log('📄 Dados do Firestore:', userData);

      this.userName = userData.publicName || user.displayName || '';
      this.userRole = userData.role === 'admin' ? 'admin' : 'hunter';

      console.log('✅ Role carregada:', this.userRole);

      if (userData.lastLogin) {
        this.lastLogin = this.datePipe.transform(
          userData.lastLogin.toDate(),
          'dd/MM/yyyy HH:mm'
        ) || '';
      }

      console.log('🕓 Último login:', this.lastLogin);
    }
  }

  get visibleLinks() {
    return this.allLinks.filter(link => !link.adminOnly || this.userRole === 'admin');
  }

  updateCurrentTime() {
    const now = new Date();
    this.currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  toggleMenu() {
    this.menuActive = !this.menuActive;
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
}
