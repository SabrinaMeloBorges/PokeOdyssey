import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import * as bootstrap from 'bootstrap';
import { NgZone } from '@angular/core';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLogin: boolean = true;

  constructor(
    public authService: AuthService,
    private router: Router,
    private firestore: AngularFirestore,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {}

  async onSubmit() {
    try {
      await this.authService.loginWithEmail(this.email, this.password);
      this.router.navigate(['/menu']);
    } catch (error: any) {
      this.errorMessage = this.getFriendlyErrorMessage(error.code);
    }
  }

  async loginGoogle(): Promise<void> {
    try {
      await this.authService.loginWithGoogle();
      this.ngZone.run(() => this.router.navigate(['/menu']));
    } catch (error: any) {
      this.errorMessage = 'Erro no login com Google';
      console.error(error);
    }
  }

  private getFriendlyErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/invalid-email': 'E-mail inválido',
      'auth/user-disabled': 'Conta desativada',
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/popup-closed-by-user': 'O popup foi fechado antes do login',
      'auth/popup-blocked': 'O navegador bloqueou o popup',
      'auth/cancelled-popup-request': 'Popup cancelado por outra solicitação',
      'auth/too-many-requests': 'Muitas tentativas. Tente mais tarde.'
    };
    return errorMessages[errorCode] || 'Erro ao fazer login';
  }

  openRegisterModal() {
    const modalElement = document.getElementById('registerModal');
    if (modalElement) {
      new bootstrap.Modal(modalElement).show();
    }
  }

  changeLoginMode() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
  }
}


