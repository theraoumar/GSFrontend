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
  userRole: string = 'USER'; // Rôle par défaut
  
  // Statistiques
  stats = {
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalStockValue: 0,
    recentMovements: 0
  };

  recentMovements: StockMovement[] = [];
  lowStockProducts: Product[] = [];

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.loadUserRole();
    await this.loadDashboardData();
  }

  // Charger le rôle de l'utilisateur
  private loadUserRole() {
    this.userRole = localStorage.getItem('role') || 'USER';
    console.log('Rôle utilisateur:', this.userRole);
  }

  // Vérifier si l'utilisateur est admin
  isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role: string): boolean {
    return this.userRole === role;
  }

  async loadDashboardData() {
    try {
      this.isLoading = true;
      
      // Charger les données en parallèle
      const [products, movements, lowStock, stats] = await Promise.all([
        this.apiService.getProducts().toPromise(),
        this.apiService.getStockMovements().toPromise(),
        this.apiService.getLowStockProducts().toPromise(),
        this.apiService.getStockStats().toPromise()
      ]);

      // Mettre à jour les statistiques
      this.updateStats(products || [], movements || [], lowStock || []);
      
      // Données récentes
      this.recentMovements = (movements || []).slice(0, 5);
      this.lowStockProducts = lowStock || [];

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private updateStats(products: Product[], movements: StockMovement[], lowStock: Product[]) {
    this.stats.totalProducts = products.length;
    this.stats.lowStockProducts = lowStock.length;
    this.stats.outOfStockProducts = products.filter(p => p.quantity === 0).length;
    this.stats.totalStockValue = products.reduce((sum, product) => 
      sum + (product.quantity * product.price), 0
    );
    this.stats.recentMovements = movements.length;
  }

  getStockStatus(product: Product): string {
    if (product.quantity === 0) return 'out-of-stock';
    if (product.quantity <= product.minStock) return 'low-stock';
    return 'in-stock';
  }

  getStockPercentage(product: Product): number {
    const maxStock = product.minStock * 3;
    return Math.min((product.quantity / maxStock) * 100, 100);
  }

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
    this.router.navigate(['/login']);
  }

  refreshData(event: any) {
    this.loadDashboardData().then(() => {
      event.target.complete();
    });
  }
}