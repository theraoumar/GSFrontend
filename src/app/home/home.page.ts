import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { IonContent, IonButton } from "@ionic/angular/standalone";
import { IonicModule } from "@ionic/angular";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent, IonButton, IonicModule],
})
export class HomePage {
  alertController: any;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToDashboard() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
  async logout() {
  const alert = await this.alertController.create({
    header: 'Déconnexion',
    message: 'Êtes-vous sûr de vouloir vous déconnecter?',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Déconnecter',
        handler: async () => {
          await this.authService.logout();
          const toast = await this.alertController.create({
            message: 'Déconnexion réussie',
            duration: 2000,
            color: 'success'
          });
          await toast.present();
          this.router.navigate(['/home']);
        }
      }
    ]
  });
  
  await alert.present();
}
}