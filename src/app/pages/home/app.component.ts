import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private auth: AngularFireAuth) {}

  // Login com Google
  async loginWithGoogle() {
    try {
      const result = await this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
      console.log('Usuário autenticado:', result.user);
      alert('Login realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
    }
  }

  // Login com Facebook
  async loginWithFacebook() {
    try {
      const result = await this.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
      console.log('Usuário autenticado:', result.user);
      alert('Login realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer login com Facebook:', error);
    }
  }

  // Login com Email e Senha
  async loginWithEmail(email: string, password: string) {
    try {
      const result = await this.auth.signInWithEmailAndPassword(email, password);
      console.log('Usuário autenticado:', result.user);
      alert('Login realizado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer login com Email:', error);
    }
  }

  // Registrar Usuário com Email e Senha
  async registarUser(email: string, password: string) {
    try {
      const result = await this.auth.createUserWithEmailAndPassword(email, password);
      console.log('Usuário registrado:', result.user);
      alert('Conta criada com sucesso!');
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
    }
  }

  // Verificar se Usuário Está Logado
  async loggedIn() {
    this.auth.authState.subscribe(user => {
      if (user) {
        console.log('Usuário está logado:', user.email);
      } else {
        console.log('Nenhum usuário logado.');
      }
    });
  }
}
