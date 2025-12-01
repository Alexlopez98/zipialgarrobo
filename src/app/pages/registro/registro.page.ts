import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DbtaskService } from '../../services/dbtask';
import { addIcons } from 'ionicons';
import { personOutline, lockClosedOutline } from 'ionicons/icons';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegistroPage implements OnInit {
  usuario: string = '';
  password: string = '';
  cargando: boolean = false;

  constructor(
    private dbtaskService: DbtaskService,
    private router: Router,
    private toastController: ToastController
  ) {
    addIcons({ personOutline, lockClosedOutline });
  }

  ngOnInit() {}

  async registrar() {
    if (!this.usuario || !this.password) {
      this.mostrarToast('Por favor completa todos los campos', 'warning');
      return;
    }

    const passRegex = /^[0-9]{4}$/;
    if (!passRegex.test(this.password)) {
      this.mostrarToast('La contraseña debe ser de 4 números (Ej: 1234)', 'danger');
      return;
    }

    this.cargando = true;

    try {
      await this.dbtaskService.registrarUsuario(this.usuario, this.password);
      
      await this.dbtaskService.actualizarSesion(this.usuario, 1);
      this.mostrarToast('¡Usuario creado con éxito!', 'success');
      
      this.router.navigate(['/home']);
      
    } catch (error) {
      console.error(error);
      this.mostrarToast('El nombre de usuario ya existe', 'danger');
    } finally {
      this.cargando = false;
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }
}