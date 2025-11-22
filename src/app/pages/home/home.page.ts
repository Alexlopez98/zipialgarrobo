import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import {
  IonContent, IonToolbar, IonButtons, IonMenuButton, IonCard, IonCardContent,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonList, IonAvatar, IonIcon,
  IonButton, IonSpinner, IonText
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { LoaderOverlayComponent } from '../../shared/loader-overlay/loader-overlay.component';
import { LottieComponent } from 'ngx-lottie';
import { DbtaskService } from '../../services/dbtask';
import { ApiConductoresService } from '../../services/api-conductores.service';
import { Geolocation } from '@capacitor/geolocation';
import { addIcons } from 'ionicons';
import { carSport, star, mapOutline, location } from 'ionicons/icons';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonToolbar, IonButtons, IonMenuButton,
    IonCard, IonCardContent, IonItem, IonLabel, IonSelect, IonSelectOption,
    IonList, IonAvatar, IonIcon, IonButton, IonSpinner, IonText,
    LoaderOverlayComponent, LottieComponent,
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  
  usuario: string = 'Invitado';
  destinoSeleccionado: string = ''; 
  cargando = false;
  mensajeCarga = '';
  mostrarAnimacion = false;
  ubicacionActual: any = null;
  listaConductores: any[] = [];

  destinos = [
    { nombre: 'Playa Canelo', costo: 2500 },
    { nombre: 'Centro Algarrobo', costo: 1500 },
    { nombre: 'Mirasol', costo: 3000 },
    { nombre: 'El Litre', costo: 2000 }
  ];

  map: L.Map | undefined;

  constructor(
    private router: Router,
    private dbtaskService: DbtaskService,
    private apiService: ApiConductoresService
  ) {
    addIcons({ carSport, star, mapOutline, location });
  }

  async ngOnInit() {
    await this.obtenerUbicacion();
    this.cargarConductores();
  }

  async ionViewWillEnter() {
    const usuarioActivo = await this.dbtaskService.obtenerUsuarioActivo();
    if (usuarioActivo) {
      this.usuario = usuarioActivo;
    }
  }

  async obtenerUbicacion() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.ubicacionActual = coordinates.coords;
      this.cargarMapa(this.ubicacionActual.latitude, this.ubicacionActual.longitude);
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
    }
  }

  cargarMapa(lat: number, lng: number) {
    if (this.map) {
        this.map.remove(); 
    }
    this.map = L.map('mapId').setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    L.marker([lat, lng]).addTo(this.map!)
      .bindPopup('¡Estás aquí!')
      .openPopup();
      
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 500);
  }

  cargarConductores() {
    this.apiService.getConductores().subscribe({
      next: (data) => {
        this.listaConductores = data.filter((c: any) => c.estado === 'Disponible');
      },
      error: (err) => {
        console.error('Error API:', err);
        this.listaConductores = [
            {nombre: 'Juan (Offline)', vehiculo: 'Error API', patente: '---', calificacion: 0}
        ];
      }
    });
  }

  async pedirViaje(conductor: any) {
    if (!this.destinoSeleccionado) {
      alert('¡Primero selecciona un destino!');
      return;
    }

    this.cargando = true;
    this.mensajeCarga = `Solicitando a ${conductor.nombre}... 🚗`;

    setTimeout(async () => {
      this.cargando = false;
      this.mostrarAnimacion = true;
      
      const destinoInfo = this.destinos.find(d => d.nombre === this.destinoSeleccionado);
      const costo = destinoInfo ? destinoInfo.costo : 0;

      try {
        await this.dbtaskService.crearViaje(
          this.usuario, 
          this.destinoSeleccionado, 
          costo,
          conductor.nombre 
        );
        console.log('Viaje guardado con conductor:', conductor.nombre);
      } catch (error) {
        console.error('Error guardando viaje', error);
      }

      setTimeout(() => {
        this.mostrarAnimacion = false;
        this.destinoSeleccionado = ''; 
      }, 3000);
    }, 2000);
  }
}