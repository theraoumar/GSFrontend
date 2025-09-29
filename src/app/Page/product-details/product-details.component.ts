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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.produitId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProduit();
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
    this.router.navigate(['/edit-product', this.produitId]);
  }

  async supprimerProduit() {
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

  retourStock() {
    this.router.navigate(['/stock']);
  }
}