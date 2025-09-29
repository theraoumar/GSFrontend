import { Preferences } from '@capacitor/preferences';
import { Injectable } from '@angular/core'; 

export interface User {
  id: number;
  username: string;
  role: 'USER' | 'ADMIN';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;

  constructor() { }

  async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      // Simulation d'une connexion - à remplacer par votre vraie API
      // Pour l'exemple, on simule différents utilisateurs
      let user: User;

      if (credentials.username === 'admin' && credentials.password === 'admin') {
        user = {
          id: 1,
          username: 'admin',
          role: 'ADMIN'
        };
      } else if (credentials.username === 'user' && credentials.password === 'user') {
        user = {
          id: 2,
          username: 'user',
          role: 'USER'
        };
      } else {
        // Simulation d'un utilisateur lambda par défaut
        user = {
          id: Date.now(),
          username: credentials.username,
          role: 'USER'
        };
      }
      
      this.currentUser = user;
      
      await Preferences.set({
        key: 'user',
        value: JSON.stringify(this.currentUser)
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    }
  }

  async register(userData: RegisterData): Promise<boolean> {
    try {
      const newUser: User = {
        id: Date.now(),
        username: userData.username,
        role: 'USER' // Par défaut, tous les nouveaux utilisateurs sont USER
      };
      
      this.currentUser = newUser;
      
      await Preferences.set({
        key: 'user',
        value: JSON.stringify(this.currentUser)
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    // Retourne l'utilisateur depuis le cache mémoire s'il existe
    if (this.currentUser) {
      return this.currentUser;
    }
    
    // Sinon, essaye de le récupérer depuis les préférences
    try {
      const { value } = await Preferences.get({ key: 'user' });
      if (value) {
        this.currentUser = JSON.parse(value);
        return this.currentUser;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    }
    
    return null;
  }

  async getCurrentUserRole(): Promise<'USER' | 'ADMIN' | null> {
    const user = await this.getCurrentUser();
    return user ? user.role : null;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  async isAdminAsync(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  isUser(): boolean {
    return this.currentUser?.role === 'USER';
  }

  async isUserAsync(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'USER';
  }

  getUserRole(): 'USER' | 'ADMIN' | null {
    return this.currentUser?.role || null;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    await Preferences.remove({ key: 'user' });
  }

  // Méthode pour mettre à jour le rôle de l'utilisateur (seulement pour les admins)
  async updateUserRole(userId: number, newRole: 'USER' | 'ADMIN'): Promise<boolean> {
    if (!this.isAdmin()) {
      console.error('Seuls les administrateurs peuvent modifier les rôles');
      return false;
    }

    // Ici, vous devrez appeler votre API backend pour mettre à jour le rôle
    // Pour l'instant, c'est une simulation
    console.log(`Mise à jour du rôle de l'utilisateur ${userId} vers ${newRole}`);
    return true;
  }

  // Méthode pour vérifier les permissions
  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;

    switch (permission) {
      case 'VIEW_PRODUCTS':
        return true; // Tous les utilisateurs peuvent voir les produits
      
      case 'VIEW_PRODUCT_DETAILS':
        return true; // Tous les utilisateurs peuvent voir les détails
      
      case 'ADD_PRODUCT':
      case 'EDIT_PRODUCT':
      case 'DELETE_PRODUCT':
        return this.isAdmin(); // Seuls les admins peuvent modifier
      
      case 'MANAGE_USERS':
        return this.isAdmin(); // Seuls les admins peuvent gérer les utilisateurs
      
      default:
        return false;
    }
  }

  async initializeUser(): Promise<void> {
    // Cette méthode peut être appelée au démarrage de l'application
    // pour initialiser l'utilisateur depuis le stockage
    await this.getCurrentUser();
  }
}