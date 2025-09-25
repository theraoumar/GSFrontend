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
   
  }

 
  login(data: NgForm) {
  if (!data.valid) {
    this.error = 'Formulaire invalide';
    return;
  }

  this.apiService.login(data.value).subscribe({
    next: (res: any) => {
      console.log("Réponse backend:", res);
      
      if (res?.token) {
        localStorage.setItem('token', res.token);
        
        // Si le rôle n'est pas dans la réponse, mettre une valeur par défaut
        const role = res.role || 'USER'; // Valeur par défaut
        localStorage.setItem('role', role);
        
        console.log('Rôle défini:', role);
        
        this.alertController.create({
          header: 'Succès',
          message: 'Connexion réussie!',
          buttons: ['OK']
        }).then(alert => alert.present());
        
        this.router.navigate(['/dashboard']);
      } else {
        this.showAlert('Erreur', 'Token non reçu du serveur');
      }
    },
    error: (error) => {
      console.error('Erreur login:', error);
      this.showAlert('Erreur', error.error?.message || 'Erreur de connexion');
    }
  });}

  goToRegister() {
      this.router.navigate(['/register']);
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