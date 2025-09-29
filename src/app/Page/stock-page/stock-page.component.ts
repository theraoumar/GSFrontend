import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api-service';
import { AuthService } from '../../services/auth-service'; // Import du service d'authentification
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonButton, IonButtons, IonMenuButton, IonItem, 
  IonList, IonIcon, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonGrid, IonRow, 
  IonCol, IonLabel, IonBadge, IonSpinner, IonSearchbar,
  IonAccordion, IonAccordionGroup, AlertController,
  ModalController, ActionSheetController
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
    IonAccordion, IonAccordionGroup
  ]
})
export class StockPageComponent implements OnInit {

  produits: Produit[] = [];
  produitsFiltres: Produit[] = [];
  isLoading = true;
  searchTerm = '';
  isAdmin: boolean = false;
  currentUser: any = null;

  // Groupes par catégorie
  produitsParCategorie: { [key: string]: Produit[] } = {};
  categories: string[] = [];

  constructor(
    private apiService: ApiService,
    private authService: AuthService, // Service d'authentification
    private router: Router,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) { }

  async ngOnInit() {
    await this.checkUserRole();
    await this.loadProduits();
  }

  // Méthode pour vérifier le rôle de l'utilisateur
  async checkUserRole() {
    try {
      // Méthode 1: Récupérer l'utilisateur depuis le service d'authentification
      this.currentUser = this.authService.getCurrentUser();
      
      if (this.currentUser) {
        this.isAdmin = this.currentUser.role === 'admin' || this.currentUser.isAdmin;
      } else {
        // Méthode 2: Vérifier via une API si nécessaire
        const userInfo = await this.authService.getCurrentUser();
        this.currentUser = userInfo;
        this.isAdmin = this.currentUser?.role === 'admin' || this.currentUser?.isAdmin;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle:', error);
      this.isAdmin = false; // Par défaut, pas admin en cas d'erreur
    }
  }

  async loadProduits() {
    try {
      this.isLoading = true;
      const produits = await this.apiService.getProducts().toPromise();
      
      // Transformez les Product en Produit avec une catégorie par défaut
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

  // Actions sur les produits - avec vérification des droits
  async ouvrirActions(produit: Produit) {
    // Vérifier si l'utilisateur est admin avant d'ouvrir le menu d'actions
    if (!this.isAdmin) {
      this.voirDetails(produit); // Rediriger vers les détails si pas admin
      return;
    }

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
    // Vérifier les droits avant de modifier
    if (!this.isAdmin) {
      this.showAccessDeniedAlert();
      return;
    }
    this.router.navigate(['/edit-product', produit.id]);
  }

  async supprimerProduit(produit: Produit) {
    // Vérifier les droits avant de supprimer
    if (!this.isAdmin) {
      this.showAccessDeniedAlert();
      return;
    }

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
              this.loadProduits(); // Recharger la liste
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  ajouterProduit() {
    // Vérifier les droits avant d'ajouter
    if (!this.isAdmin) {
      this.showAccessDeniedAlert();
      return;
    }
    this.router.navigate(['/add-product']);
  }

  // Méthode pour afficher une alerte d'accès refusé
  async showAccessDeniedAlert() {
    const alert = await this.alertController.create({
      header: 'Accès Refusé',
      message: 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action. Seuls les administrateurs peuvent modifier le stock.',
      buttons: ['OK']
    });

    await alert.present();
  }

  retourDashboard() {
    this.router.navigate(['/dashboard']);
  }

  refreshData(event: any) {
    this.loadProduits().then(() => {
      if (event && event.target) {
        event.target.complete();
      }
    });
  }

  getLowStockCount(): number {
    return this.produitsFiltres.filter(p => p.quantity <= 10 && p.quantity > 0).length;
  }

  getOutOfStockCount(): number {
    return this.produitsFiltres.filter(p => p.quantity === 0).length;
  }

  // Méthode utilitaire pour afficher le rôle actuel (debug)
  getCurrentUserRole(): string {
    return this.isAdmin ? 'Administrateur' : 'Utilisateur';
  }
}