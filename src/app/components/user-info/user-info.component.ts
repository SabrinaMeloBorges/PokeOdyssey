import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit, OnDestroy {
  @Input() userName: string = 'Treinador';
  @Input() lastLogin: string = '';
  @Input() currentTime: string = '';

  userDisplayName: string = 'Carregando...';
  userEmail: string = 'Carregando...';
  userPhotoURL: string | null = null;
  loading: boolean = true;
  error: string | null = null;
  private timeSubscription!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserData();
    this.setupRealTimeClock();
  }

  private loadUserData(): void {
    try {
      this.userDisplayName = this.authService.getCurrentUserDisplayName();
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      this.userDisplayName = 'Usuário'; 
    }
  }

  private setupRealTimeClock(): void {
    this.updateTime();
    this.timeSubscription = interval(1000).subscribe(() => this.updateTime());
  }

  private updateTime(): void {
    const options = {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    this.currentTime = new Date().toLocaleTimeString('pt-BR', options);
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }
}
