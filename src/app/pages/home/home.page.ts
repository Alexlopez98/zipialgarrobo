import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { LoaderOverlayComponent } from '../../shared/loader-overlay/loader-overlay.component';
import { LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, LoaderOverlayComponent, LottieComponent],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage {
  usuario: string = 'Invitado';
  cargando = false;
  mensajeCarga = '';
  mostrarAnimacion = false;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.usuario = nav?.extras?.state?.['usuario'] || 'Invitado';
  }

  goToPerfil() {
    this.router.navigate(['/perfil'], { state: { usuario: this.usuario } });
  }

  goToViajes() {
    this.router.navigate(['/viajes'], { state: { usuario: this.usuario } });
  }

  pedirViaje() {
    this.cargando = true;
    this.mensajeCarga = 'Buscando conductor en Algarrobo... 🚗';

    setTimeout(() => {
      this.cargando = false;
      this.mostrarAnimacion = true;

      // Ocultamos la animación luego de 3 segundos
      setTimeout(() => {
        this.mostrarAnimacion = false;
      }, 3000);
    }, 2500);
  }
}
