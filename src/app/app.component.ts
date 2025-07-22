import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private ngZone: NgZone
  ) {
    console.log('🧩 AppComponent carregado');
  }

  ngOnInit(): void {
    console.log('🚀 ngOnInit iniciado');

    this.afAuth.authState.subscribe(user => {
      console.log('🔄 Estado de auth mudou:', user);

      if (user) {
        this.ngZone.run(() => {
          console.log('✅ Redirecionando para /menu');
          this.router.navigate(['/menu']);
        });
      } else {
        this.ngZone.run(() => {
          console.log('🔁 Redirecionando para /login');
          this.router.navigate(['/login']);
        });
      }
    });
  }
}
