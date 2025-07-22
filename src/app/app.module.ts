import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Firebase Modules
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';

// Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Components
import { LoginComponent } from './components/login/login.component';
import { MenuComponent } from './components/menu/menu.component';
import { TelaUsuariosComponent } from './components/tela-usuarios/tela-usuarios.component';
import { PokemonsComponent } from './components/pokemons/pokemons.component';
import { PokedexComponent } from './components/pokedex/pokedex.component';
import { CapturarComponent } from './components/capturar/capturar.component';
import { CadastroComponent } from './components/cadastro/cadastro.component';
import { UserInfoComponent } from './components/user-info/user-info.component';
import { AcessoNegadoComponent } from './components/acesso-negado/acesso-negado.component';

// Guards e Services
import { AuthGuard } from './guards/auth.guard';
import { PokemonService } from './services/pokemon.service';
import { AuthService } from './services/auth.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MenuComponent,
    TelaUsuariosComponent,
    PokemonsComponent,
    PokedexComponent,
    CapturarComponent,
    CadastroComponent,
    UserInfoComponent,
    AcessoNegadoComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  providers: [
    AuthGuard,
    PokemonService,
    AuthService 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
