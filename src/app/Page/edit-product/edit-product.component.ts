import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonButton, IonButtons, IonMenuButton, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, 
  IonGrid, IonRow, IonCol, IonLabel, IonInput,
  IonSpinner, IonItem, IonSelect, IonSelectOption, IonIcon
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Product } from '../../services/api-service';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonButtons, IonMenuButton, IonCard, 
    IonCardHeader, IonCardTitle, IonCardContent, 
    IonGrid, IonRow, IonCol, IonLabel, IonInput,
    IonSpinner, IonItem, IonSelect, IonSelectOption, IonIcon
  ]
})
export class EditProductComponent implements OnInit {
  produit: Product = {
    id: 0,
    name: '',
    price: 0,
    quantity: 0,
    categorie: ''
  };
  
  isLoading = true;
  isSaving = false;
  produitId!: number;

  categories = ['Fruits',
    'Légumes', 
    'Produits Laitiers',
    'Viandes',
    'Poissons',
    'Épicerie',
    'Boissons',
    'Surgelés',
    'Bio',
    'Autres'];

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
      const produitData = await this.apiService.getProduct(this.produitId).toPromise();
      if (produitData) {
        this.produit = {
          ...produitData,
          categorie: produitData.categorie || '' // Assurez-vous que categorie est bien initialisé
        };
        console.log('Produit chargé:', this.produit); // Debug
      }
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error);
      this.showAlert('Erreur', 'Impossible de charger le produit');
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit() {
    console.log('Données avant envoi:', this.produit); // Debug

    // Validation corrigée - la catégorie ne devrait pas être obligatoire
    if (!this.produit.name || this.produit.name.trim() === '') {
      this.showAlert('Erreur', 'Le nom du produit est obligatoire');
      return;
    }

    if (!this.produit.price || this.produit.price <= 0) {
      this.showAlert('Erreur', 'Le prix doit être supérieur à 0');
      return;
    }

    if (this.produit.quantity < 0) {
      this.showAlert('Erreur', 'La quantité ne peut pas être négative');
      return;
    }

    this.isSaving = true;

    try {
      const response = await this.apiService.updateProduct(this.produitId, this.produit).toPromise();
      console.log('Réponse du serveur:', response); // Debug
      this.showAlert('Succès', 'Produit modifié avec succès', true);
    } catch (error: any) {
      console.error('Erreur complète lors de la modification:', error);
      console.error('Status:', error.status);
      console.error('Message:', error.message);
      console.error('Body:', error.error);
      
      let messageErreur = 'Une erreur est survenue lors de la modification';
      if (error.status === 400) {
        messageErreur = 'Données invalides envoyées au serveur';
      } else if (error.status === 500) {
        messageErreur = 'Erreur serveur - vérifiez les logs du backend';
      }
      
      this.showAlert('Erreur', messageErreur);
    } finally {
      this.isSaving = false;
    }
  }

  async showAlert(header: string, message: string, redirect: boolean = false) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            if (redirect) {
              this.router.navigate(['/product-details', this.produitId]);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  annuler() {
    this.router.navigate(['/product-details', this.produitId]);
  }

  retourStock() {
    this.router.navigate(['/stock']);
  }
}