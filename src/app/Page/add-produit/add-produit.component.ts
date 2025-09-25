import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonButton, IonButtons, IonBackButton, IonItem, 
  IonLabel, IonInput, IonSelect, IonSelectOption,
  IonTextarea, IonAlert, IonSpinner, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonIcon, IonText, IonBadge 
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApiService, Product } from '../../services/api-service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-produit.component.html',
  styleUrls: ['./add-produit.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, 
    IonButton, IonButtons, IonBackButton, IonItem, 
    IonLabel, IonInput, IonSelect, IonSelectOption,
    IonTextarea, IonAlert, IonSpinner, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent,
    IonGrid, IonRow, IonCol, IonIcon, IonText, IonBadge 
  ]
})
export class AddProductPage {
  product: any = {
    name: '',
    price: 0,
    quantity: 0
    // Retirer category, minStock, supplier, status qui n'existent pas dans votre entité
  };

  isLoading = false;
  showAlert = false;
  alertHeader = '';
  alertMessage = '';

  // Conserver les catégories si vous voulez les utiliser côté frontend seulement
  categories = [
    'Fruits',
    'Légumes', 
    'Produits Laitiers',
    'Viandes',
    'Poissons',
    'Épicerie',
    'Boissons',
    'Surgelés',
    'Bio',
    'Autres'
  ];

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  async onSubmit() {
    // Vérifier l'authentification
    const token = localStorage.getItem('token');
    if (!token) {
      this.showAlertMessage('Erreur', 'Vous devez être connecté pour ajouter un produit');
      this.router.navigate(['/login']);
      return;
    }

    // Validation du formulaire simplifiée
    if (!this.isFormValid()) {
      this.showAlertMessage('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.product.price <= 0) {
      this.showAlertMessage('Erreur', 'Le prix doit être supérieur à 0');
      return;
    }

    if (this.product.quantity < 0) {
      this.showAlertMessage('Erreur', 'La quantité ne peut pas être négative');
      return;
    }

    this.isLoading = true;

    try {
      // Préparer les données EXACTEMENT comme votre entité Spring Boot
      const productData = {
        name: this.product.name,
        price: this.product.price,
        quantity: this.product.quantity
        // Ne pas envoyer de champs qui n'existent pas dans l'entité
      };

      console.log('Données envoyées au backend:', productData);

      // Appel à l'API
      const newProduct = await this.apiService.addProduct(productData).toPromise();
      
      console.log('Réponse du backend:', newProduct);
      
      this.showAlertMessage('Succès', 'Produit ajouté avec succès!');
      
      // Redirection après 2 secondes
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);

    } catch (error: any) {
      console.error('Erreur complète:', error);
      
      let errorMessage = 'Une erreur est survenue lors de l\'ajout du produit';
      
      if (error.status === 401) {
        errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      } else if (error.status === 400) {
        errorMessage = 'Données invalides. Vérifiez le format des données.';
      } else if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
      
      this.showAlertMessage('Erreur', errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  private isFormValid(): boolean {
    return !!this.product.name?.trim() && 
           this.product.price !== undefined &&
           this.product.quantity !== undefined;
  }

  private showAlertMessage(header: string, message: string) {
    this.alertHeader = header;
    this.alertMessage = message;
    this.showAlert = true;
  }

  onAlertDismiss() {
    this.showAlert = false;
  }

  // Réinitialiser le formulaire
  resetForm() {
    this.product = {
      name: '',
      price: 0,
      quantity: 0
    };
  }

  // Méthodes pour l'affichage du statut (optionnel - côté frontend seulement)
  getStatusText(): string {
    const quantity = this.product.quantity || 0;
    if (quantity === 0) return 'Rupture de stock';
    if (quantity <= 10) return 'Stock faible'; // 10 comme valeur arbitraire
    return 'En stock';
  }

  getStatusColor(): string {
    const quantity = this.product.quantity || 0;
    if (quantity === 0) return 'danger';
    if (quantity <= 10) return 'warning';
    return 'success';
  }
}