import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import {
  IonContent,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { LoaderOverlayComponent } from '../../shared/loader-overlay/loader-overlay.component';
import { LottieComponent } from 'ngx-lottie';
import { DbtaskService } from '../../services/dbtask';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    LoaderOverlayComponent,
    LottieComponent,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  usuario: string = 'Invitado';
  destinoSeleccionado: string = ''; 
  cargando = false;
  mensajeCarga = '';
  mostrarAnimacion = false;

  destinos = [
    { nombre: 'Playa Canelo', costo: 2500 },
    { nombre: 'Centro Algarrobo', costo: 1500 },
    { nombre: 'Mirasol', costo: 3000 },
    { nombre: 'El Litre', costo: 2000 }
  ];

  constructor(
    private router: Router,
    private dbtaskService: DbtaskService
  ) {}

  async ionViewWillEnter() {
    const usuarioActivo = await this.dbtaskService.obtenerUsuarioActivo();
    if (usuarioActivo) {
      this.usuario = usuarioActivo;
    }
  }

  async pedirViaje() {
    if (!this.destinoSeleccionado) {
      alert('Por favor selecciona un destino');
      return;
    }

    this.cargando = true;
    this.mensajeCarga = `Buscando conductor a ${this.destinoSeleccionado}... 🚗`;

    setTimeout(async () => {
      this.cargando = false;
      this.mostrarAnimacion = true;
      const destinoInfo = this.destinos.find(d => d.nombre === this.destinoSeleccionado);
      const costo = destinoInfo ? destinoInfo.costo : 0;

      try {
        await this.dbtaskService.crearViaje(this.usuario, this.destinoSeleccionado, costo);
        console.log('Viaje guardado en BD');
      } catch (error) {
        console.error('Error guardando viaje', error);
      }

      setTimeout(() => {
        this.mostrarAnimacion = false;
        this.destinoSeleccionado = ''; 
      }, 3000);
    }, 2500);
  }
}