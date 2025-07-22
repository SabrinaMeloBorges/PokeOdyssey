import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private firestore: AngularFirestore) {}

  getUsers(): Observable<User[]> {
    return this.firestore.collection<User>('users').snapshotChanges().pipe(
      map(actions => 
        actions.map(a => {
          const data = a.payload.doc.data() as User;
          const uid = a.payload.doc.id;
          return {
            uid,
            name: data.name || data.displayName || '',        // ✅ Incluído campo 'name'
            displayName: data.displayName || '',              // ✅ Mantido para consistência
            email: data.email || '',
            role: this.convertRole(data.role),
            capturedPokemons: data.capturedPokemons || []
          };
        })
      )
    );
  }

  updateUser(user: Partial<User>): Promise<void> {
    const updateData = {
      ...user,
      role: user.role === 'admin' ? 'admin' : 'hunter'
    };
    delete updateData.uid;

    return this.firestore.doc(`users/${user.uid}`).update(updateData);
  }

  private convertRole(role: string): 'hunter' | 'admin' {
    return role === 'admin' ? 'admin' : 'hunter';
  }
}
