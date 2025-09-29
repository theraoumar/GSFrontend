import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonButton, IonButtons, IonMenu, IonMenuButton, 
  IonItem, IonList, IonIcon, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonGrid, IonRow, 
  IonCol, IonLabel, IonBadge, IonProgressBar, IonSpinner
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { ApiService, Product, StockMovement } from '../../services/api-service';

// Interface alignée avec votre entité backend
interface Produit {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string; // Vous devrez peut-être adapter selon comment vous gérez les images
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, 
    IonButton, IonButtons, IonMenu, IonMenuButton, 
    IonItem, IonList, IonIcon, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonGrid, IonRow, 
    IonCol, IonLabel, IonBadge, IonProgressBar, IonSpinner
  ]
})
export class DashboardPage implements OnInit {
  user: any = {};
  isLoading = true;
  userRole: string = 'USER';

  // Statistiques
  stats = {
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalStockValue: 0,
    recentMovements: 0
  };

  recentMovements: StockMovement[] = [];
  lowStockProducts: Produit[] = [];
  allProducts: Produit[] = [];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.loadUserRole();
    await this.loadDashboardData();
  }

  private loadUserRole() {
    this.userRole = localStorage.getItem('role') || 'USER';
    console.log('Rôle utilisateur:', this.userRole);
  }

  isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  hasRole(role: string): boolean {
    return this.userRole === role;
  }

  async loadDashboardData() {
    try {
      this.isLoading = true;
      
      // Charger les produits (adaptez selon votre API)
      const products = await this.apiService.getProducts().toPromise();
      this.allProducts = products || [];
      
      // Calculer les statistiques
      this.updateStats(this.allProducts);
      
      // Identifier les produits en stock faible (vous pouvez ajuster le seuil)
      this.lowStockProducts = this.allProducts.filter(p => 
        p.quantity <= 10 && p.quantity > 0 // Exemple: stock faible si <= 10 unités
      );

      // Charger les mouvements si disponible
      try {
        const movements = await this.apiService.getStockMovements().toPromise();
        this.recentMovements = (movements || []).slice(0, 5);
        this.stats.recentMovements = movements?.length || 0;
      } catch (error) {
        console.warn('Mouvements non disponibles:', error);
        this.recentMovements = [];
      }

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private updateStats(products: Produit[]) {
    this.stats.totalProducts = products.length;
    this.stats.lowStockProducts = products.filter(p => p.quantity <= 10 && p.quantity > 0).length;
    this.stats.outOfStockProducts = products.filter(p => p.quantity === 0).length;
    this.stats.totalStockValue = products.reduce((sum, product) => 
      sum + (product.quantity * product.price), 0
    );
  }

  // Méthodes de navigation
  navigateToStock() {
    this.router.navigate(['/stock']);
  }

  navigateToMovements() {
    this.router.navigate(['/movements']);
  }

  navigateToLowStock() {
    this.router.navigate(['/low-stock']);
  }

  navigateToAddProduct() {
    this.router.navigate(['/add-product']);
  }

  logout() {
    this.authService.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  refreshData(event: any) {
    this.loadDashboardData().then(() => {
      if (event && event.target) {
        event.target.complete();
      }
    });
  }

  
}