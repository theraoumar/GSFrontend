import { Preferences } from '@capacitor/preferences';
import { Injectable } from '@angular/core'; 

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: any = null;

  constructor() { }

  async login(credentials: { email: string, password: string }): Promise<boolean> {
    // Simulation d'une connexion - remplacer par une vraie API
    if (credentials.email === 'test@example.com' && credentials.password === 'password') {
      this.currentUser = {
        id: 1,
        name: 'Utilisateur Test',
        email: credentials.email
      };
      
      await Preferences.set({
        key: 'user',
        value: JSON.stringify(this.currentUser)
      });
      
      return true;
    }
    return false;
  }

  async register(user: any): Promise<boolean> {
    // Simulation d'enregistrement - remplacer par une vraie API
    this.currentUser = {
      id: Date.now(),
      name: user.name,
      email: user.email
    };
    
    await Preferences.set({
      key: 'user',
      value: JSON.stringify(this.currentUser)
    });
    
    return true;
  }

  async getCurrentUser(): Promise<any> {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    const { value } = await Preferences.get({ key: 'user' });
    if (value) {
      this.currentUser = JSON.parse(value);
      return this.currentUser;
    }
    
    return null;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  logout() {
    // Supprimer les données d'authentification
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    
    // Optionnel: Supprimer d'autres données utilisateur
    localStorage.clear();
    
    console.log('Utilisateur déconnecté');
  }
}
