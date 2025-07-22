import { Component, HostListener, OnInit } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-pokedex',
  templateUrl: './pokedex.component.html',
  styleUrls: ['./pokedex.component.css']
})
export class PokedexComponent implements OnInit {
  pokemons: any[] = [];
  menuActive = false;
  isMobile = window.innerWidth < 768;
  isAdmin: boolean = false;

  loading = false;
  offset = 0;
  limit = 150;
  maxPokemon = 1025;
  allPokemonsLoaded = false;

  allLinks = [
    { name: 'Menu', path: '/menu' },
    { name: 'Usuários', path: '/usuarios', adminOnly: true },
    { name: 'Pokémons', path: '/pokemons' },
    { name: 'Registrar Pokémons', path: '/cadastro', adminOnly: true },
    { name: 'Pokédex', path: '/pokedex' },
    { name: 'Capturar', path: '/capturar', hunterOnly: true },
  ];

  links: any[] = [];

  constructor(
    private pokemonService: PokemonService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPokemon();

    this.authService.isAdmin().pipe(take(1)).subscribe(isAdmin => {
      this.isAdmin = isAdmin;
      this.links = this.allLinks.filter(link => !link.adminOnly || isAdmin);
    });
  }

  toggleMenu(): void {
    this.menuActive = !this.menuActive;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.menuActive = false;
    }
  }

  getLinkAnimation(index: number): string {
    return this.menuActive ? `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s` : '';
  }

  trackById(index: number, pokemon: any): number {
    return pokemon.id;
  }

  loadPokemon(): void {
    if (this.loading || this.allPokemonsLoaded) return;

    this.loading = true;

    this.pokemonService.getPokemonList(this.offset, this.limit).subscribe({
      next: (newPokemons) => {
        // Verifica se o campo image está presente
        newPokemons = newPokemons.map(pokemon => ({
          ...pokemon,
          image: pokemon.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
        }));

        this.pokemons = [...this.pokemons, ...newPokemons];
        this.offset += this.limit;
        this.loading = false;

        if (this.offset >= this.maxPokemon) {
          this.allPokemonsLoaded = true;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar Pokémon:', err);
        this.loading = false;
      }
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.shouldLoadMore()) {
      this.loadPokemon();
    }
  }

  private shouldLoadMore(): boolean {
    const threshold = 200;
    const position = window.scrollY + window.innerHeight;
    const height = document.body.scrollHeight;
    return position > height - threshold && !this.loading && !this.allPokemonsLoaded;
  }

  getTypeClass(type: string): string {
    return `type-${type.toLowerCase()}`;
  }
}
