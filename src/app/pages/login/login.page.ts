import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular'; // Importar AlertController
import { Router } from '@angular/router';
import { DbtaskService } from '../../services/dbtask';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage {
  usuario: string = '';
  password: string = '';
  error: string = ''; 

  constructor(
    private router: Router, 
    private dbtaskService: DbtaskService,
    private alertCtrl: AlertController
  ) {}

  async login() {
    this.error = ''; 

    const passNum = parseInt(this.password);

    if (!this.usuario || isNaN(passNum)) {
      this.error = 'Credenciales inválidas';
      return;
    }

    try {
      const res = await this.dbtaskService.validarUsuario(this.usuario, passNum);
      
      if (res.rows.length > 0) {
        await this.dbtaskService.actualizarSesion(this.usuario, 1);
        this.router.navigate(['/home']);
      } else {
        const alert = await this.alertCtrl.create({
          header: 'Usuario no encontrado',
          message: '¿Desea registrarse con estas credenciales?',
          buttons: [
            { text: 'No', role: 'cancel' },
            { 
              text: 'Sí', 
              handler: () => {
                this.registrar(passNum);
              }
            }
          ]
        });
        await alert.present();
      }
    } catch (error) {
      console.error(error);
      this.error = 'Error al conectar con la base de datos';
    }
  }

  async registrar(passNum: number) {
    try {
      await this.dbtaskService.registrarUsuario(this.usuario, passNum);
      this.presentAlert('Éxito', 'Usuario registrado! Ingresando...');
      this.router.navigate(['/home']);
    } catch (error) {
      this.error = 'El usuario ya existe.';
    }
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}