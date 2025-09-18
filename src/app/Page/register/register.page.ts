import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegisterPage implements OnInit {
  @ViewChild('registerForm', { static: false }) registerForm!: NgForm;
  
  user = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  nameInvalid = false;
  emailInvalid = false;
  passwordInvalid = false;
  confirmPasswordInvalid = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
  }

  async register() {
    if (this.user.password !== this.user.confirmPassword) {
      this.showAlert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const success = await this.authService.register(this.user);
      if (success) {
        const toast = await this.toastController.create({
          message: 'Votre compte a été créé avec succès!',
          duration: 3000,
          color: 'success',
          position: 'top'
        });
        await toast.present();
        
        this.router.navigate(['/login']);
      } else {
        this.showAlert('Erreur', "Impossible de créer le compte. L'email est peut-être déjà utilisé.");
      }
    } catch (error) {
      this.showAlert('Erreur', 'Une erreur est survenue lors de la création du compte.');
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  checkName() {
    this.nameInvalid = this.user.name.length < 2;
  }

  checkEmail() {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    this.emailInvalid = !emailPattern.test(this.user.email);
  }

  checkPassword() {
    this.passwordInvalid = this.user.password.length < 6;
  }

  checkConfirmPassword() {
    this.confirmPasswordInvalid = this.user.password !== this.user.confirmPassword;
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