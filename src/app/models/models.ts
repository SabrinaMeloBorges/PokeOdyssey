// define a estrutura do usuario
export interface User {
    id: string; 
    name: string; 
    email: string; 
    role: 'hunter' | 'admin'; // tipo do perfil
    capturedPokemons?: PokemonCaptured[]; //lista de pokemons capturados
  }

// define a estrutura do pokemon capturado
  export interface PokemonCaptured {
    id: number;
    name: string;
    captureDate: Date;
    imageUrl: string;
  }