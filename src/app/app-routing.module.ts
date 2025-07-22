import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MenuComponent } from './components/menu/menu.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { TelaUsuariosComponent } from './components/tela-usuarios/tela-usuarios.component';
import { PokemonsComponent } from './components/pokemons/pokemons.component';
import { PokedexComponent } from './components/pokedex/pokedex.component';
import { CapturarComponent } from './components/capturar/capturar.component';
import { CadastroComponent } from './components/cadastro/cadastro.component';
import { AdminGuard } from './guards/admin.guard';
import { AcessoNegadoComponent } from './components/acesso-negado/acesso-negado.component';

const routes: Routes = [
  { 
    path: 'menu', 
    component: MenuComponent,
    canActivate: [AuthGuard]  
  },
  { 
    path: 'usuarios', 
    component: TelaUsuariosComponent,
    canActivate: [AuthGuard, AdminGuard],
    data: { 
      role: 'admin' 
    } 
  },
  { 
    path: 'pokemons', 
    component: PokemonsComponent,
    canActivate: [AuthGuard]  
  },
  { 
    path: 'pokedex', 
    component: PokedexComponent,
    canActivate: [AuthGuard]  
  },
  { 
    path: 'capturar', 
    component: CapturarComponent,
    canActivate: [AuthGuard],
    data: {
      role:'hunter'
    },
  },
  { 
    path: 'cadastro', 
    component: CadastroComponent,
    canActivate: [AuthGuard, AdminGuard],
    data: {
      role: 'admin'
    }
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  {
    path: 'acesso-negado',
    component: AcessoNegadoComponent
  },
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/login' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }