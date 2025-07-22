import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { PokemonService } from 'src/app/services/pokemon.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.component.html',
  styleUrls: ['./cadastro.component.css']
})
export class CadastroComponent implements OnInit, OnDestroy {
  pokemonForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  imagePreview: string | null = null;
  menuActive = false;
  isLoading = false;

  tiposDisponiveis: string[] = [
    'grass', 'fire', 'water', 'bug', 'normal', 'poison', 'electric', 'ground',
    'fairy', 'fighting', 'psychic', 'rock', 'ghost', 'ice', 'dragon', 'steel', 'dark', 'flying'
  ];

  selectedTypes: string[] = [];

  links = [
    { name: 'Menu', path: '/menu' },
    { name: 'Usuários', path: '/usuarios' },
    { name: 'Pokémons', path: '/pokemons' },
    { name: 'Registrar Pokémons', path: '/cadastro' },
    { name: 'Pokédex', path: '/pokedex' },
    { name: 'Capturar', path: '/capturar' },
  ];

  private scrollPosition = 0;
  users: any[] = [];

  constructor(
    private fb: FormBuilder,
    private renderer: Renderer2,
    private pokemonService: PokemonService,
    private router: Router,
    private authService: AuthService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.lockScroll();
  }

  ngOnDestroy() {
    this.unlockScroll();
  }

  private lockScroll() {
    this.scrollPosition = window.pageYOffset;
    this.renderer.setStyle(document.body, 'position', 'fixed');
    this.renderer.setStyle(document.body, 'top', `-${this.scrollPosition}px`);
    this.renderer.setStyle(document.body, 'width', '100%');
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  private unlockScroll() {
    this.renderer.removeStyle(document.body, 'position');
    this.renderer.removeStyle(document.body, 'top');
    this.renderer.removeStyle(document.body, 'width');
    this.renderer.removeStyle(document.body, 'overflow');
    window.scrollTo(0, this.scrollPosition);
  }

  validateArrayNotEmpty() {
    return (control: AbstractControl) => {
      return Array.isArray(control.value) && control.value.length > 0
        ? null
        : { required: true };
    };
  }

  createForm() {
    this.pokemonForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      imageUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      captureRate: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
      types: [[], [this.validateArrayNotEmpty()]]
    });

    const imageUrlControl = this.pokemonForm.get('imageUrl');
    if (imageUrlControl) {
      imageUrlControl.valueChanges.subscribe(url => {
        this.imagePreview = url;
      });
    }
  }

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  getLinkAnimation(index: number): string {
    return this.menuActive ? `fadeIn 0.5s ease forwards ${index * 0.1}s` : '';
  }

  toggleTypeSelection(tipo: string) {
    if (this.selectedTypes.includes(tipo)) {
      this.selectedTypes = this.selectedTypes.filter(t => t !== tipo);
    } else if (this.selectedTypes.length < 2) {
      this.selectedTypes.push(tipo);
    }

    const typesControl = this.pokemonForm.get('types');
    if (typesControl) {
      typesControl.setValue(this.selectedTypes);
      typesControl.markAsTouched();
    }
  }
  gerarNumeroAleatorio(): number {
    return Math.floor(Math.random() * 1000) + 1;
  }
  

  async onSubmit() {
    this.submitted = true;
  
    if (this.pokemonForm.invalid) {
      this.errorMessage = 'Por favor, preencha todos os dados do formulário.';
      return;
    }
  
    this.isLoading = true;
    this.errorMessage = '';
  
    try {
      const types = this.pokemonForm.value.types;
      const currentUserId = await this.authService.getCurrentUserUid();
  
      const pokemonData = {
        name: this.pokemonForm.value.name,
        image: this.pokemonForm.value.imageUrl,
        types: types,
        primaryType: types[0] || '',
        captureRate: Number(this.pokemonForm.value.captureRate)
      };
  
      await this.pokemonService.addPokemon(pokemonData).toPromise();
  
      this.successMessage = 'Pokémon cadastrado com sucesso!';
      setTimeout(() => {
        this.pokemonForm.reset();
        this.submitted = false;
        this.successMessage = '';
        this.imagePreview = null;
        this.selectedTypes = [];
      }, 2000);
  
    } catch (error) {
      console.error('Erro ao cadastrar Pokémon:', error);
      this.errorMessage = 'Erro ao cadastrar Pokémon. Tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }
}