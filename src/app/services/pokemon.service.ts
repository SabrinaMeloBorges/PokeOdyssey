import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from './auth.service';


interface Pokemon {
  image: string;
  id?: string | number;
  name: string;
  types?: string[];
  primaryType?: string;
  imageUrl?: string;
  captureRate?: number;
  createdAt?: Date;
  createdBy?: { uid: string, displayName: string };}

interface PokemonResult {
  name: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon';
  private cachedPokemons: Pokemon[] = [];
  addPokemonToApiAndFirebase: any;

  constructor(
    private http: HttpClient,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private authService: AuthService,
  ) { }

  getPokemonList(offset: number, limit: number): Observable<Pokemon[]> {
    return this.http.get<{results: PokemonResult[]}>(`${this.apiUrl}?offset=${offset}&limit=${limit}`).pipe(
      switchMap(response => {
        const detailRequests = response.results.map(result => 
          this.getPokemonDetails(result.url)
        );
        return forkJoin(detailRequests);
      }),
      map((pokemons: (Pokemon | null)[]) => {
        const validPokemons = pokemons.filter(p => p !== null) as Pokemon[];
        this.cachedPokemons = [...this.cachedPokemons, ...validPokemons]
          .filter((p, i, a) => a.findIndex(v => this.getId(v) === this.getId(p)) === i)
          .sort((a, b) => {
            const idA = this.getId(a);
            const idB = this.getId(b);
            return (idA > idB) ? 1 : (idA < idB) ? -1 : 0;
          });
        return this.cachedPokemons.slice(offset, offset + limit);
      }),
      catchError(error => {
        console.error('Error fetching Pokémon list:', error);
        return of([]);
      })
    );
  }

  private getId(pokemon: Pokemon): number {
    return typeof pokemon.id === 'number' ? pokemon.id : 
           typeof pokemon.id === 'string' ? parseInt(pokemon.id, 10) || 0 : 0;
  }

  getPokemonDetails(url: string): Observable<Pokemon | null> {
    return this.http.get<any>(url).pipe(
      map(details => ({
        id: details.id,
        name: details.name,
        image: details.sprites.other['official-artwork'].front_default || 
                  details.sprites.front_default,
        types: details.types.map((t: any) => t.type.name),
        primaryType: details.types[0].type.name,
        captureRate: details.capture_rate
      })),
      catchError(error => {
        console.error('Error fetching Pokémon details:', error);
        return of(null);
      })
    );
  }

  addPokemon(pokemonData: Omit<Pokemon, 'id' | 'createdAt' | 'createdBy'>): Observable<string> {
    return from(this.afAuth.currentUser).pipe(
      switchMap(firebaseUser => {
        const localUser = this.authService.getCurrentUser();
        const uid = localUser && localUser.uid ? localUser.uid : 'uid-desconhecido';
        const displayName = this.authService.getCurrentUserDisplayName();
  
        const pokemonWithMeta = {
          ...pokemonData,
          createdAt: new Date(),
          createdBy: {
            uid,
            displayName
          }
        };
  
        return from(this.firestore.collection('pokemons').add(pokemonWithMeta)).pipe(
          switchMap(docRef => {
            const newPokemon = { ...pokemonWithMeta, id: docRef.id };
            return this.savePokemonToApi(newPokemon);
          })
        );
      }),
      map(docRef => docRef.id),
      catchError(error => {
        console.error('Erro ao cadastrar Pokémon:', error);
        throw error;
      })
    );
  }
  
  private savePokemonToApi(pokemon: Pokemon): Observable<any> {
    const apiUrl = 'https://sua-api.com/pokemons';
    return this.http.post(apiUrl, pokemon).pipe(
      catchError(error => {
        console.error('Erro ao salvar Pokémon na API:', error);
        return of(null);
      })
    );
  }

  updatePokemon(id: string, pokemonData: Partial<Pokemon>): Observable<void> {
    return from(this.firestore.collection('pokemons').doc(id).update(pokemonData)).pipe(
      catchError(error => {
        console.error('Erro ao atualizar Pokémon:', error);
        throw error;
      })
    );
  }

  getCustomPokemons(): Observable<Pokemon[]> {
    return this.firestore.collection<Pokemon>('pokemons')
      .valueChanges({ idField: 'id' })
      .pipe(
        catchError(error => {
          console.error('Error fetching custom Pokémons:', error);
          return of([]);
        })
      );
  }

  getPokemonById(id: string): Observable<Pokemon | undefined> {
    return this.firestore.collection('pokemons').doc(id)
      .valueChanges()
      .pipe(
        map(pokemon => pokemon as Pokemon | undefined),
        catchError(error => {
          console.error('Error fetching Pokémon by ID:', error);
          return of(undefined);
        })
      );
  }
}