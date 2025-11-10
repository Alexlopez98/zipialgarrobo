import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { LottieComponent } from 'ngx-lottie';
import { LoaderOverlayComponent } from '../../shared/loader-overlay/loader-overlay.component';
import { addIcons } from 'ionicons';
import { checkmarkCircleOutline } from 'ionicons/icons';

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
  password = '';
  correo = '';
  telefono = '';
  ubicacion = '';
  showLoader = false;
  mensajeCarga = '';
  showLogoutOverlay = false;

  constructor(private router: Router) {
    addIcons({ checkmarkCircleOutline });
  }

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state;

    if (state) {
      this.usuario = state['usuario'] || '';
      this.password = state['password'] || '';
    }
  }

  volver() {
    this.router.navigate(['/home'], {
      state: { usuario: this.usuario, password: this.password }
    });
  }

  cerrarSesion() {
    this.showLogoutOverlay = true;

    setTimeout(() => {
      this.showLogoutOverlay = false;
      this.router.navigate(['/login']);
    }, 2500);
  }

  showSuccessMessage = false;

  guardarCambios() {
    this.showLoader = true;
    this.showSuccessMessage = false;

    setTimeout(() => {
      this.showLoader = false;
      this.showSuccessMessage = true;

      
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 3000);
    }, 2500);
  }

}