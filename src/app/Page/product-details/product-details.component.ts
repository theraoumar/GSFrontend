import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonButton, IonButtons, IonMenuButton, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, 
  IonGrid, IonRow, IonCol, IonLabel, IonBadge,
  IonSpinner, IonIcon
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Product } from '../../services/api-service';
import { AuthService } from '../../services/auth-service'; // Import du service d'authentification

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, IonHeader, IonTitle,
    IonToolbar, IonButton, IonButtons, IonMenuButton, IonCard, 
    IonCardHeader, IonCardTitle, IonCardContent, 
    IonGrid, IonRow, IonCol, IonLabel, IonBadge,
    IonSpinner, IonIcon
  ]
})
export class ProductDetailsComponent implements OnInit {
  produit: Product | null = null;
  isLoading = true;
  produitId!: number;
  isAdmin: boolean = false;
  currentUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService, // Service d'authentification
    private alertController: AlertController
  ) { }

  async ngOnInit() {
    await this.checkUserRole();
    this.produitId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProduit();
  }

  // Méthode pour vérifier le rôle de l'utilisateur
  async checkUserRole() {
    try {
      // Récupérer l'utilisateur depuis le service d'authentification
      this.currentUser = this.authService.getCurrentUser();
      
      if (this.currentUser) {
        this.isAdmin = this.currentUser.role === 'admin' || this.currentUser.isAdmin;
      } else {
        // Vérifier via une API si nécessaire
        const userInfo = await this.authService.getCurrentUser;
        this.currentUser = userInfo;
        this.isAdmin = this.currentUser?.role === 'admin' || this.currentUser?.isAdmin;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle:', error);
      this.isAdmin = false; // Par défaut, pas admin en cas d'erreur
    }
  }

  async loadProduit() {
    try {
      this.isLoading = true;
      this.produit = await this.apiService.getProduct(this.produitId).toPromise() || null;
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getStockStatus(quantity: number): { color: string, text: string } {
    if (quantity === 0) {
      return { color: 'danger', text: 'Rupture de stock' };
    } else if (quantity <= 10) {
      return { color: 'warning', text: 'Stock faible' };
    } else {
      return { color: 'success', text: 'En stock' };
    }
  }

  modifierProduit() {
    // Vérifier les droits avant de modifier
    if (!this.isAdmin) {
      this.showAccessDeniedAlert();
      return;
    }
    this.router.navigate(['/edit-product', this.produitId]);
  }

  async supprimerProduit() {
    // Vérifier les droits avant de supprimer
    if (!this.isAdmin) {
      this.showAccessDeniedAlert();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer "${this.produit?.name}" ? Cette action est irréversible.`,
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
              await this.apiService.deleteProduct(this.produitId).toPromise();
              this.router.navigate(['/stock']);
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Méthode pour afficher une alerte d'accès refusé
  async showAccessDeniedAlert() {
    const alert = await this.alertController.create({
      header: 'Accès Refusé',
      message: 'Vous n\'avez pas les permissions nécessaires pour effectuer cette action. Seuls les administrateurs peuvent modifier ou supprimer les produits.',
      buttons: ['OK']
    });

    await alert.present();
  }

  retourStock() {
    this.router.navigate(['/stock']);
  }

  // Méthode utilitaire pour afficher le rôle actuel (debug)
  getCurrentUserRole(): string {
    return this.isAdmin ? 'Administrateur' : 'Utilisateur';
  }
}