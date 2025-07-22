import { Component, HostListener, OnInit } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';

@Component({
  selector: 'app-pokedex',
  templateUrl: './pokedex.component.html',
  styleUrls: ['./pokedex.component.css']
})
export class PokedexComponent implements OnInit {
  pokemons: any[] = [];
  loading = false;
  offset = 0;
  limit = 15;
  maxPokemon = 150;
  allPokemonsLoaded = false;

  constructor(private pokemonService: PokemonService) { }

  ngOnInit(): void {
    this.loadPokemon();
  }

  loadPokemon(): void {
    if (this.loading || this.allPokemonsLoaded) return;

    this.loading = true;
    
    this.pokemonService.getPokemonList(this.offset, this.limit).subscribe({
      next: (newPokemons) => {
        this.pokemons = [...this.pokemons, ...newPokemons];
        this.offset += this.limit;
        this.loading = false;

        if (this.offset >= this.maxPokemon) {
          this.allPokemonsLoaded = true;
        }
      },
      error: (err) => {
        console.error('Error loading Pokémon:', err);
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
}