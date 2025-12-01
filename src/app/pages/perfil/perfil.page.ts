import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular'; 
import { Router } from '@angular/router';
import { LottieComponent } from 'ngx-lottie';
import { LoaderOverlayComponent } from '../../shared/loader-overlay/loader-overlay.component';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline, arrowBackOutline, cameraOutline } from 'ionicons/icons';
import { Storage } from '@ionic/storage-angular';
import { DbtaskService } from '../../services/dbtask';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, LoaderOverlayComponent, LottieComponent],
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PerfilPage implements OnInit {
  usuario = ''; 
  nombre = '';  
  password = ''; 
  correo = '';
  telefono = '';
  ubicacion = '';
  
  fotoPerfil = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';
  
  showLoader = false;
  showLogoutOverlay = false;
  showSuccessMessage = false;

  constructor(
    private router: Router,
    private storage: Storage,
    private dbtaskService: DbtaskService,
    private alertCtrl: AlertController 
  ) {
    addIcons({ checkmarkCircleOutline, arrowBackOutline, cameraOutline });
    this.initStorage();
  }

  async initStorage() {
    await this.storage.create();
  }

  async ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state;

    if (state && state['usuario']) {
      this.usuario = state['usuario'];
    } else {
      const usuarioActivo = await this.dbtaskService.obtenerUsuarioActivo();
      if (usuarioActivo) this.usuario = usuarioActivo;
    }

    if (this.usuario) this.cargarDatosPerfil();
  }

  async cambiarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl, 
        source: CameraSource.Prompt 
      });

      if (image.dataUrl) {
        this.fotoPerfil = image.dataUrl;
      }
    } catch (error) {
      console.log('Usuario canceló o error cámara', error);
    }
  }

  async cargarDatosPerfil() {
    const datos = await this.storage.get(`perfil_${this.usuario}`);
    if (datos) {
      this.nombre = datos.nombre || '';
      this.correo = datos.correo || '';
      this.telefono = datos.telefono || '';
      this.ubicacion = datos.ubicacion || '';
      this.password = datos.password || ''; 
      if (datos.foto) this.fotoPerfil = datos.foto;
    }
  }

  volver() {
    this.router.navigate(['/home'], { state: { usuario: this.usuario } });
  }

  async cerrarSesion() {
    this.showLogoutOverlay = true;
    if (this.usuario) await this.dbtaskService.actualizarSesion(this.usuario, 0);
    setTimeout(() => {
      this.showLogoutOverlay = false;
      this.router.navigate(['/login'], { replaceUrl: true });
    }, 2500);
  }

  async guardarCambios() {
    // Validar si hay contraseña escrita y si cumple el formato
    if (this.password) {
      const passRegex = /^[0-9]{4}$/;
      if (!passRegex.test(this.password)) {
        this.mostrarAlerta('Error', 'La contraseña debe ser numérica de 4 dígitos.');
        return;
      }

      // --- AQUÍ ESTÁ EL CAMBIO PRINCIPAL ---
      // Actualizamos la contraseña también en la Base de Datos SQL para el Login
      try {
        await this.dbtaskService.actualizarPassword(this.usuario, this.password);
      } catch (error) {
        console.error('Error al sincronizar password con BD:', error);
      }
    }

    this.showLoader = true;
    this.showSuccessMessage = false;

    // Guardamos datos del perfil (foto, nombre, etc.) en Storage Local
    const datosPerfil = {
      nombre: this.nombre,
      correo: this.correo,
      telefono: this.telefono,
      ubicacion: this.ubicacion,
      password: this.password,
      foto: this.fotoPerfil 
    };

    await this.storage.set(`perfil_${this.usuario}`, datosPerfil);

    setTimeout(() => {
      this.showLoader = false;
      this.showSuccessMessage = true;
      setTimeout(() => { this.showSuccessMessage = false; }, 3000);
    }, 1500);
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header, message, buttons: ['OK']
    });
    await alert.present();
  }
}