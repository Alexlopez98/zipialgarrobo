import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { LottieComponent } from 'ngx-lottie';
import { addIcons } from 'ionicons';
import { star, starOutline } from 'ionicons/icons';

@Component({
  selector: 'app-viajes',
  standalone: true,
  imports: [CommonModule, IonicModule, LottieComponent],
  templateUrl: './viajes.page.html',
  styleUrls: ['./viajes.page.scss']
})
export class ViajesPage implements OnInit {
  viajes: any[] = [];
  mostrarAnimacion = false;

  animacionEstrellas = {
    path: 'assets/animations/starrating.json',
    loop: false,
    autoplay: true
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private alertController: AlertController
  ) {
   
    addIcons({ star, starOutline });
  }

  ngOnInit() {
    
    this.viajes = [
      {
        id: 1,
        destino: 'Playa El Canelo',
        conductor: 'Carlos Pérez',
        duracion: '12 min',
        costo: '$3.200',
        calificacion: 0,
        calificado: false
      },
      {
        id: 2,
        destino: 'Muelle de Algarrobo',
        conductor: 'María López',
        duracion: '8 min',
        costo: '$2.800',
        calificacion: 0,
        calificado: false
      },
      {
        id: 3,
        destino: 'Mirador El Yeco',
        conductor: 'José Martínez',
        duracion: '15 min',
        costo: '$3.900',
        calificacion: 0,
        calificado: false
      }
    ];
  }

  
  mostrarCalificacion(viaje: any) {
    if (viaje.calificado) return;
  }

  
  calificar(viaje: any, estrellas: number) {
    if (viaje.calificado) return;

    viaje.calificacion = estrellas;
    viaje.calificado = true;
    this.mostrarAnimacion = true;

    const tiempoBaseMs = 500;
    const tiempoAdicionalPorEstrellaMs = 1000;
    const duracionTotal = tiempoBaseMs + (estrellas * tiempoAdicionalPorEstrellaMs);

    setTimeout(() => {
      this.mostrarAnimacion = false;
      this.cdr.detectChanges();
    }, duracionTotal);
  }

  
  async limpiarHistorial() {
    if (this.viajes.length === 0) {
      const alertaVacio = await this.alertController.create({
        header: 'Sin historial',
        message: 'No hay viajes para limpiar.',
        buttons: ['OK']
      });
      await alertaVacio.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Deseas limpiar el historial de viajes?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, limpiar',
          handler: () => {
            this.viajes = [];
            this.cdr.detectChanges();
          }
        }
      ]
    });

    await alert.present();
  }
}
