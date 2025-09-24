import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { ApiService } from 'src/app/services/api-service';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {
  error: string = '';
  credentials = {
    username: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    // Vérifier si l'utilisateur est déjà connecté
    // if (this.authService.isAuthenticated()) {
    //   this.router.navigate(['/dashboard']);
    // }
  }

  // async loginSimulation() {
  //   try {
  //     const success = await this.authService.login(this.credentials);
  //     if (success) {
  //       this.router.navigate(['/dashboard']);
  //     } else {
  //       this.showAlert('Erreur de connexion', 'Username ou mot de passe incorrect.');
  //     }
  //   } catch (error) {
  //     this.showAlert('Erreur', 'Une erreur est survenue lors de la connexion.');
  //   }
  // }

  login(data: NgForm) {
    if (data.valid) {
      this.error='Username ou mot de passe incorrect';
      return;
    }
    this.apiService.login(data)
      .subscribe({
      next: (res:any) => {
        console.log(res);
        if(res ){
          localStorage.setItem('token', res.role);
          console.log(res);
          this.alertController.create({
            header: 'Succès',
            message: 'Connexion réussie!',
            buttons: ['OK']
          }).then(alert => alert.present());
          this.router.navigate(['/dashboard']);
        };
        }
      });



  }


  // goToRegister() {
  //   this.router.navigate(['/register']);
  // }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}