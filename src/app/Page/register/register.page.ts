import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { ApiService } from 'src/app/services/api-service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegisterPage implements OnInit {
  error: string = '';
  credentials = {
    username: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private apiService: ApiService
  ) { }

  ngOnInit() { }

  register(data: NgForm) {
    if (!data.valid) {
      this.showAlert('Erreur', 'Formulaire invalide');
      return;
    }

    if (this.credentials.password !== this.credentials.confirmPassword) {
      this.showAlert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    this.apiService.register(data.value).subscribe({
      next: (res: any) => {
        console.log("Réponse backend:", res);
        if (res) {
          if (res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('role', res.role || 'user');
          }
          this.showAlert('Succès', 'Inscription réussie! Vous pouvez maintenant vous connecter.');
          this.router.navigate(['/login']);
        }
      },
      error: (err: any) => {
        console.error("Erreur backend:", err);
        let errorMessage = 'Erreur lors de l\'inscription. Veuillez réessayer.';
        
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 400) {
          errorMessage = 'Données invalides';
        }
        
        this.showAlert('Erreur', errorMessage);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}