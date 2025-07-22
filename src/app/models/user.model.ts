export interface User {
  displayName: string;
  uid: string;
  name: string;
  email: string;
  role: 'hunter' | 'admin';
  capturedPokemons?: Pokemon[];
}

export interface Pokemon {
  id: number;
  name: string;
  imageUrl?: string;
  captureDate?: Date;
}