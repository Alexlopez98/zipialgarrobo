import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { LottieComponent } from 'ngx-lottie';
import { addIcons } from 'ionicons';
import { star, starOutline, carSportOutline, calendarOutline, cashOutline, trashOutline, arrowBackOutline } from 'ionicons/icons';
import { DbtaskService } from '../../services/dbtask';
import { ApiConductoresService } from '../../services/api-conductores.service';

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
  
  usuarioActivo: string = '';

  animacionEstrellas = {
    path: 'assets/animations/starrating.json',
    loop: false,
    autoplay: true
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private alertController: AlertController,
    private dbtaskService: DbtaskService,
    private apiService: ApiConductoresService 
  ) {
    addIcons({ star, starOutline, carSportOutline, calendarOutline, cashOutline, trashOutline, arrowBackOutline });
  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.usuarioActivo = await this.dbtaskService.obtenerUsuarioActivo() || '';
    
    if (this.usuarioActivo) {
      await this.cargarViajes();
    }
  }

  async cargarViajes() {
    try {
      const datosBD = await this.dbtaskService.obtenerViajes(this.usuarioActivo);
      
      this.viajes = datosBD.map((viaje: any) => ({
        id: viaje.id,
        destino: viaje.destino,
        fecha: viaje.fecha, 
        costo: typeof viaje.costo === 'number' ? `$${viaje.costo}` : viaje.costo,
        estado: viaje.estado,
        conductor: viaje.conductor || 'Conductor Zipi', 
        duracion: '15 min',          
        
        // RECUPERAMOS EL ESTADO REAL DE LA BD (Persistencia)
        calificacion: viaje.calificacion || 0,     
        calificado: viaje.calificado || false    
      }));
      
      console.log('Viajes cargados:', this.viajes);

    } catch (error) {
      console.error('Error al cargar viajes', error);
    }
  }

  calificar(viaje: any, estrellas: number) {
    // Si ya está calificado, bloqueamos la acción (Regla de negocio: 1 voto por viaje)
    if (viaje.calificado) return;

    // 1. ACTUALIZACIÓN VISUAL INMEDIATA
    viaje.calificacion = estrellas;
    viaje.calificado = true;
    this.mostrarAnimacion = true;

    // 2. GUARDAR EN BASE DE DATOS LOCAL (SQLite)
    // Esto asegura que si cierras la app, recuerde que ya votaste
    this.dbtaskService.actualizarCalificacionViaje(viaje.id, estrellas).then(() => {
      console.log('Calificación guardada en local');
    }).catch(e => console.error('Error guardando en local', e));

    // 3. ENVIAR A LA API (BACKEND)
    // Buscamos al conductor por nombre para obtener su ID y actualizar su promedio
    this.apiService.getConductores().subscribe({
      next: (conductores) => {
        const conductorEncontrado = conductores.find(c => c.nombre === viaje.conductor);
        
        if (conductorEncontrado) {
          this.apiService.calificarConductor(conductorEncontrado.id, estrellas).subscribe({
            next: () => console.log(`API actualizada: ${conductorEncontrado.nombre} recibió ${estrellas} estrellas`),
            error: (err) => console.error('Error al enviar a API:', err)
          });
        }
      },
      error: (err) => console.error('No se pudo conectar con la API para calificar', err)
    });

    // 4. ANIMACIÓN Y RESET
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
      message: '¿Deseas eliminar todo tu historial de la base de datos?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, limpiar',
          handler: async () => {
            await this.dbtaskService.eliminarHistorial(this.usuarioActivo);
            
            this.viajes = []; 
            this.cdr.detectChanges();
          }
        }
      ]
    });

    await alert.present();
  }
}