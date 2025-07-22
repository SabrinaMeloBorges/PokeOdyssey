import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import 'firebase/auth';
import { Observable, of, from } from 'rxjs';
import { switchMap, map, take, tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getRoleFromLocalStorage(): string | null {
    return localStorage.getItem('userRole');
  }
  
  getCurrentUserUid(): string | null {
    const user = firebase.auth().currentUser;
    return user ? user.uid : null;
  }
  
    
  private _userData: firebase.User | null = null;
  private _publicName: string = '';
  user$: Observable<firebase.User | null>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private ngZone: NgZone
  ) {
    // Impede login automático ao reabrir a aba/navegador
    this.afAuth.setPersistence(firebase.auth.Auth.Persistence.SESSION).catch(err => {
      console.error('❌ Erro ao definir persistência:', err);
    });

    this.user$ = this.afAuth.authState.pipe(
      tap(async user => {
        this._userData = user;

        if (user) {
          const userRef = this.afs.collection('users').doc(user.uid);
          const userDoc = await userRef.get().toPromise();

          if (userDoc && userDoc.exists) {
            await userRef.update({
              lastLogin: firebase.firestore.FieldValue.serverTimestamp()
            });

            const data = userDoc.data() as any;
            this._publicName = data.publicName || user.displayName || '';
          }
        } else {
          this._userData = null;
          this._publicName = '';
        }

        console.log("🟢 Estado de auth mudou:", user);
      })
    );
  }

  getCurrentUserDisplayName(): string {
    if (this._publicName) return this._publicName;
    if (this._userData && this._userData.displayName) return this._userData.displayName;
    if (this._userData && this._userData.email) return this._userData.email;
    return 'Sem nome';
  }

  async loginWithEmail(email: string, password: string): Promise<void> {
    try {
      const result = await this.afAuth.signInWithEmailAndPassword(email, password);
      this._userData = result.user;

      if (this._userData) {
        const userRef = this.afs.collection('users').doc(this._userData.uid);
        const userDoc = await userRef.get().toPromise();

        if (!userDoc.exists) {
          const userData = {
            uid: this._userData.uid,
            email: this._userData.email,
            displayName: this._userData.displayName || '',
            photoURL: this._userData.photoURL || '',
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            role: 'hunter',
            publicName: this._userData.displayName || ''
          };
          await userRef.set(userData, { merge: true });
          console.log('🆕 Novo usuário com email criado como hunter');
          this._publicName = userData.publicName;
        } else {
          await userRef.update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
          });
          console.log('🔁 Usuário já existe, role preservada');
          const data = userDoc.data() as any;
          this._publicName = data.publicName || this._userData.displayName || '';
        }

        this.ngZone.run(() => {
          this.router.navigate(['/menu']);
        });
      } else {
        console.warn('⚠️ Login retornou sem usuário!');
      }
    } catch (error) {
      console.error('❌ Erro no login com email/senha:', error);
      throw error;
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const result = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
      const user = result.user;

      if (user) {
        this._userData = user;
        const userRef = this.afs.collection('users').doc(user.uid);
        const userDoc = await userRef.get().toPromise();

        if (!userDoc.exists) {
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            role: 'hunter',
            publicName: user.displayName || ''
          };
          await userRef.set(userData, { merge: true });
          console.log('🆕 Novo usuário com Google criado como hunter');
          this._publicName = userData.publicName;
        } else {
          await userRef.update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
          });
          console.log('🔁 Usuário do Google já existe, role preservada');
          const data = userDoc.data() as any;
          this._publicName = data.publicName || user.displayName || '';
        }

        this.ngZone.run(() => {
          this.router.navigate(['/menu']);
        });
      }
    } catch (error) {
      console.error('❌ Erro no login com Google:', error);
      throw error;
    }
  }

  isLoggedIn(): boolean {
    return !!this._userData;
  }

  async signUp(email: string, password: string): Promise<firebase.auth.UserCredential> {
    try {
      const result = await this.afAuth.createUserWithEmailAndPassword(email, password);
      this._userData = result.user;
      return result;
    } catch (error) {
      console.error('❌ Erro no cadastro:', error);
      throw error;
    }
  }

/*   async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      this._userData = null;
      this._publicName = '';
      this.ngZone.run(() => {
        this.router.navigate(['/login']);
      });
    } catch (error) {
      console.error('❌ Erro ao sair:', error);
      throw error;
    }
  } */

  getCurrentUser(): firebase.User | null {
    return this._userData;
  }

  isAdmin(): Observable<boolean> {
    return this.user$.pipe(
      take(1),
      switchMap(user => {
        if (!user) return of(false);
        return from(this.afs.doc(`users/${user.uid}`).get()).pipe(
          map((doc: DocumentSnapshot<any>) => {
            const data = doc.data();
            return data && data.role === 'admin';
          }),
          catchError(() => of(false))
        );
      })
    );
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
    } catch (error) {
      console.error('❌ Erro ao enviar email de redefinição de senha:', error);
      throw error;
    }
  }
}