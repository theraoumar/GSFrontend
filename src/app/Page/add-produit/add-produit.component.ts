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
  product: Partial<Product> = {
    name: '',
    category: '',
    quantity: 0,
    price: 0,
    minStock: 0,
    supplier: '',
    status: 'in-stock'
  };

  isLoading = false;
  showAlert = false;
  alertHeader = '';
  alertMessage = '';

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

  suppliers = [
    'Fournisseur A',
    'Fournisseur B',
    'Fournisseur C',
    'Fournisseur D',
    'Local',
    'Importé'
  ];

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  async onSubmit() {
    // Validation du formulaire
    if (!this.isFormValid()) {
      this.showAlertMessage('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.product.price! <= 0) {
      this.showAlertMessage('Erreur', 'Le prix doit être supérieur à 0');
      return;
    }

    if (this.product.minStock! < 0) {
      this.showAlertMessage('Erreur', 'Le stock minimum ne peut pas être négatif');
      return;
    }

    this.isLoading = true;

    try {
      // Préparer les données pour l'API
      const productData = {
        name: this.product.name,
        category: this.product.category,
        quantity: this.product.quantity || 0,
        price: this.product.price,
        minStock: this.product.minStock,
        supplier: this.product.supplier,
        lastUpdated: new Date().toISOString(),
        status: this.calculateStatus(this.product.quantity || 0, this.product.minStock || 0)
      };

      // Appel à l'API
      const newProduct = await this.apiService.addProduct(productData).toPromise();
      
      this.showAlertMessage('Succès', 'Produit ajouté avec succès!');
      
      // Redirection après 2 secondes
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 2000);

    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      let errorMessage = 'Une erreur est survenue lors de l\'ajout du produit';
      
      if (error.status === 400) {
        errorMessage = 'Données invalides. Vérifiez les informations saisies.';
      } else if (error.status === 409) {
        errorMessage = 'Un produit avec ce nom existe déjà.';
      }
      
      this.showAlertMessage('Erreur', errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  private isFormValid(): boolean {
    return !!this.product.name?.trim() && 
           !!this.product.category && 
           !!this.product.supplier &&
           this.product.price !== undefined &&
           this.product.minStock !== undefined;
  }

  private calculateStatus(quantity: number, minStock: number): 'in-stock' | 'low-stock' | 'out-of-stock' {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= minStock) return 'low-stock';
    return 'in-stock';
  }

  private showAlertMessage(header: string, message: string) {
    this.alertHeader = header;
    this.alertMessage = message;
    this.showAlert = true;
  }

  onAlertDismiss() {
    this.showAlert = false;
  }

  // Calcul automatique du statut basé sur la quantité et le stock minimum
  onQuantityChange() {
    if (this.product.quantity !== undefined && this.product.minStock !== undefined) {
      this.product.status = this.calculateStatus(this.product.quantity, this.product.minStock);
    }
  }

  onMinStockChange() {
    if (this.product.quantity !== undefined && this.product.minStock !== undefined) {
      this.product.status = this.calculateStatus(this.product.quantity, this.product.minStock);
    }
  }

  // Réinitialiser le formulaire
  resetForm() {
    this.product = {
      name: '',
      category: '',
      quantity: 0,
      price: 0,
      minStock: 0,
      supplier: '',
      status: 'in-stock'
    };
  }
  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'in-stock': return 'En stock';
      case 'low-stock': return 'Stock faible';
      case 'out-of-stock': return 'Rupture de stock';
      default: return 'Non défini';
    }
  }
  getStatusColor(status: string | undefined): string {
    switch (status) {
      case 'in-stock': return 'success';
      case 'low-stock': return 'warning';
      case 'out-of-stock': return 'danger';
      default: return 'medium';
    }
  }
}