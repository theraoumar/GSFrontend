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

  // register(data: NgForm) {
  //   if (!data.valid) {
  //     this.error = 'Formulaire invalide';
  //     return;
  //   }

  //   if (this.credentials.password !== this.credentials.confirmPassword) {
  //     this.error = 'Les mots de passe ne correspondent pas';
  //     return;
  //   }

  //   if (this.credentials.password.length < 6) {
  //     this.error = 'Le mot de passe doit contenir au moins 6 caractères';
  //     return;
  //   }

    

  //   this.apiService.register(data.value).subscribe({
  //     next: (res: any) => {
  //       console.log("Réponse backend:", res);
  //       if (res?.success || res?.token) {
  //         // Si le backend retourne un token directement
  //         if (res.token) {
  //           console.log("Token reçu", res);
  //           localStorage.setItem('token', res.token);
  //           localStorage.setItem('role', res.role || 'user');
  //         }
          
  //         this.alertController.create({
  //           header: 'Succès',
  //           message: 'Inscription réussie! Vous pouvez maintenant vous connecter.',
  //           buttons: ['OK']
  //         }).then(alert => {
  //           alert.present();
  //           alert.onDidDismiss().then(() => {
  //             this.router.navigate(['/login']);
  //           });
  //         });
  //       }
  //     },
  //     error: (err: any) => { // Type explicit pour err
  //       console.error("Erreur backend:", err);
  //       if (err.error?.message) {
  //         this.error = err.error.message;
  //       } else if (err.status === 400) {
  //         this.error = 'Données invalides';
  //       } else {
  //         this.error = 'Erreur lors de l\'inscription. Veuillez réessayer.';
  //       }
  //     }
  //   });
  // }

    register(data: NgForm) {
    if (!data.valid) {
      this.error = 'Formulaire invalide';
      return;
    }
    this.apiService.register(data.value).subscribe({
      next: (res: any) => {
        console.log("Réponse backend:", res);
        if (res) {
        
            console.log("Token reçu si y en a ", res);
            localStorage.setItem('token', res.token);
            localStorage.setItem('role', res.role || 'user');
          
          this.alertController.create({
            header: 'Succès',
            message: 'Inscription réussie! Vous pouvez maintenant vous connecter.',
            buttons: ['OK']
          }).then(alert => {
            alert.present();
            alert.onDidDismiss().then(() => {
              this.router.navigate(['/login']);
            });
          });
        }
      },
      error: (err: any) => { // Type explicit pour err
        console.error("Erreur backend:", err);
        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.status === 400) {
          this.error = 'Données invalides';
        } else {
          this.error = 'Erreur lors de l\'inscription. Veuillez réessayer.';
        }
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