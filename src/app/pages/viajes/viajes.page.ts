import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
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
    autoplay: true // Se reproduce sola cuando aparece
  };

  constructor(private cdr: ChangeDetectorRef) {
    // Registra los íconos de estrellas
    addIcons({ star, starOutline });
  }

  ngOnInit() {
    // Resetea los viajes cada vez que se carga la página (sin localStorage)
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

  // Función opcional
  mostrarCalificacion(viaje: any) {
    if (viaje.calificado) return;
  }

  // --- FUNCIÓN CALIFICAR (con tiempo dinámico) ---
  calificar(viaje: any, estrellas: number) {
    // Si ya fue calificado, no hacer nada
    if (viaje.calificado) {
      return;
    }

    viaje.calificacion = estrellas;
    viaje.calificado = true;

    // 1. Muestra el overlay
    this.mostrarAnimacion = true; 

    // --- ¡LÓGICA DE TIEMPO DINÁMICO! ---
    // 2. Define tus tiempos (en milisegundos)
    // Puedes ajustar estos dos valores:
    const tiempoBaseMs = 500;                 // 1.5 segundos (tiempo mínimo)
    const tiempoAdicionalPorEstrellaMs = 1000; // 0.3 segundos extra por estrella

    // 3. Calcula el tiempo total
    const duracionTotal = tiempoBaseMs + (estrellas * tiempoAdicionalPorEstrellaMs);
    
    // (Ej: 1 estrella = 1.8s, 5 estrellas = 3.0s)
    // --- Fin de la lógica de tiempo ---

    // 4. Usa el tiempo total calculado en el setTimeout
    setTimeout(() => {
      this.mostrarAnimacion = false;
      // Forzar la detección de cambios
      this.cdr.detectChanges(); 
    }, duracionTotal); // <-- Usa la variable dinámica
  }

}