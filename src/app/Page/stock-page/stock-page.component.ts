import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api-service';
import { AuthService } from './../../services/auth-service';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonButton, IonButtons, IonMenuButton, IonItem, 
  IonList, IonIcon, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonGrid, IonRow, 
  IonCol, IonLabel, IonBadge, IonSpinner, IonSearchbar,
  IonAccordion, IonAccordionGroup, AlertController,IonRefresher,
  ModalController, ActionSheetController, RefresherCustomEvent,
  IonRefresherContent
} from '@ionic/angular/standalone';

interface Produit {
  id: number;
  name: string;
  price: number;
  quantity: number;
  categorie: string;
}

@Component({
  selector: 'app-stock-page',
  templateUrl: './stock-page.component.html',
  styleUrls: ['./stock-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, 
    IonButton, IonButtons, IonMenuButton, IonItem, 
    IonList, IonIcon, IonCard, IonCardHeader, 
    IonCardTitle, IonCardContent, IonGrid, IonRow, 
    IonCol, IonLabel, IonBadge, IonSpinner, IonSearchbar,
    IonAccordion, IonAccordionGroup, IonRefresher, IonRefresherContent,
  ]
})
export class StockPageComponent implements OnInit, OnDestroy {

  produits: Produit[] = [];
  produitsFiltres: Produit[] = [];
  isLoading = true;
  searchTerm = '';
  userRole: string = 'USER';
  
  // Groupes par catégorie
  produitsParCategorie: { [key: string]: Produit[] } = {};
  categories: string[] = [];

  private refreshSubscription: Subscription = new Subscription();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) { }

  async ngOnInit() {
    this.loadUserRole();
    this.setupAutoRefresh();
    await this.loadProduits();
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

  ngOnDestroy() {
    // Nettoyer les subscriptions
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
  setupAutoRefresh() {
    this.refreshSubscription = this.apiService.refresh$.subscribe(shouldRefresh => {
      if (shouldRefresh) {
        console.log('Rafraîchissement automatique déclenché depuis le service');
        this.loadProduits();
      }
    });
  }

  async manualRefresh() {
    this.isLoading = true;
    try {
      await this.loadProduits();
    } finally {
      this.isLoading = false;
    }
  }

  async loadProduits() {
    try {
      this.isLoading = true;
      const produits = await this.apiService.getProducts().toPromise();
      
      this.produits = (produits || []).map(produit => ({
        ...produit,
        categorie: (produit as any).categorie || 'Non catégorisé'
      }));
      
      this.produitsFiltres = [...this.produits];
      this.grouperParCategorie();
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      this.isLoading = false;
    }
  }

  grouperParCategorie() {
    this.produitsParCategorie = {};
    
    this.produitsFiltres.forEach(produit => {
      const categorie = this.getCategorie(produit);
      if (!this.produitsParCategorie[categorie]) {
        this.produitsParCategorie[categorie] = [];
      }
      this.produitsParCategorie[categorie].push(produit);
    });
    
    this.categories = Object.keys(this.produitsParCategorie).sort();
  }

  getCategorie(produit: Produit): string {
    if ((produit as any).categorie) {
        return produit.categorie || 'Non catégorisé';
    }    
    if (produit.price < 10) return 'Économique';
    if (produit.price < 50) return 'Standard';
    if (produit.price >= 50) return 'Premium';
    
    return 'Non catégorisé';
  }
  
  filtrerProduits() {
    if (!this.searchTerm) {
      this.produitsFiltres = [...this.produits];
    } else {
      const terme = this.searchTerm.toLowerCase();
      this.produitsFiltres = this.produits.filter(produit =>
        produit.name.toLowerCase().includes(terme) ||
        produit.categorie?.toLowerCase().includes(terme)
      );
    }
    this.grouperParCategorie();
  }

  getStockStatus(quantity: number): { color: string, text: string } {
    if (quantity === 0) {
      return { color: 'danger', text: 'Rupture' };
    } else if (quantity <= 10) {
      return { color: 'warning', text: 'Faible' };
    } else {
      return { color: 'success', text: 'Bon' };
    }
  }

  // Actions sur les produits - restreintes aux admins
  async ouvrirActions(produit: Produit) {
    if (!this.isAdmin()) return; // Correction: ajouter les parenthèses

    const actionSheet = await this.actionSheetController.create({
      header: produit.name,
      buttons: [
        {
          text: 'Voir les détails',
          icon: 'eye-outline',
          handler: () => {
            this.voirDetails(produit);
          }
        },
        {
          text: 'Modifier',
          icon: 'create-outline',
          handler: () => {
            this.modifierProduit(produit);
          }
        },
        {
          text: 'Supprimer',
          icon: 'trash-outline',
          role: 'destructive',
          handler: () => {
            this.supprimerProduit(produit);
          }
        },
        {
          text: 'Annuler',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  voirDetails(produit: Produit) {
    this.router.navigate(['/product-details', produit.id]);
  }

  modifierProduit(produit: Produit) {
    if (!this.isAdmin()) return; // Correction: ajouter les parenthèses
    this.router.navigate(['/edit-product', produit.id]);
  }

  async supprimerProduit(produit: Produit) {
    if (!this.isAdmin()) return;

    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer "${produit.name}" ?`,
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel'
        },
        {
          text: 'Supprimer',
          role: 'destructive',
          handler: async () => {
            try {
              await this.apiService.deleteProduct(produit.id).toPromise();
              // Le rafraîchissement automatique se fera via l'abonnement refresh$
              // car deleteProduct() appelle triggerRefresh()
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              // Même en cas d'erreur, déclencher le rafraîchissement
              this.apiService.triggerRefresh();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  ajouterProduit() {
    if (!this.isAdmin()) return; // Correction: ajouter les parenthèses
    this.router.navigate(['/add-product']);
  }

  retourDashboard() {
    this.router.navigate(['/dashboard']);
  }

  // Correction de la fonction refreshData avec le bon type
  async refreshData(event: RefresherCustomEvent) {
    try {
      this.loadProduits();
    } finally {
      // S'assurer que event.target existe et a la méthode complete
      if (event && event.target && typeof event.target.complete === 'function') {
        event.target.complete();
      }
    }
  }

  getLowStockCount(): number {
    return this.produitsFiltres.filter(p => p.quantity <= 10 && p.quantity > 0).length;
  }

  getOutOfStockCount(): number {
    return this.produitsFiltres.filter(p => p.quantity === 0).length;
  }
}