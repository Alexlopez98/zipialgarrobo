import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController, ViewWillEnter } from '@ionic/angular';
import { ApiConductoresService } from '../../services/api-conductores.service';
import { DbtaskService } from '../../services/dbtask'; // Importamos el servicio de BD Local
import { addIcons } from 'ionicons';
import { trashOutline, arrowBackOutline, personCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-eliminar-conductor',
  templateUrl: './eliminar-conductor.page.html',
  styleUrls: ['./eliminar-conductor.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EliminarConductorPage implements ViewWillEnter {

  listaConductores: any[] = [];

  constructor(
    private apiService: ApiConductoresService,
    private dbtaskService: DbtaskService, // Inyectamos DbTask para saber quién está logueado
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ trashOutline, arrowBackOutline, personCircleOutline });
  }

  // Se ejecuta cada vez que entras a la pestaña
  ionViewWillEnter() {
    this.cargarConductores();
  }

  cargarConductores() {
    this.apiService.getConductores().subscribe({
      next: (data) => {
        this.listaConductores = data;
      },
      error: (err) => console.error('Error cargando conductores:', err)
    });
  }

  async confirmarEliminacion(conductor: any) {
    // 1. OBTENER USUARIO ACTUAL
    const usuarioActual = await this.dbtaskService.obtenerUsuarioActivo();

    // 2. VALIDACIÓN DE PROPIEDAD (En el Frontend)
    // Si el conductor no tiene propietario (ej. antiguos) o no coincide, bloqueamos.
    if (!conductor.propietario || conductor.propietario !== usuarioActual) {
      const alert = await this.alertController.create({
        header: 'Acceso Denegado',
        subHeader: 'No puedes eliminar este conductor',
        message: `Solo el usuario <strong>${conductor.propietario || 'desconocido'}</strong> puede eliminar este registro.`,
        buttons: ['Entendido']
      });
      await alert.present();
      return; // Detenemos la función aquí
    }

    // 3. SI PASA LA VALIDACIÓN, PEDIMOS CONFIRMACIÓN
    const alert = await this.alertController.create({
      header: 'Confirmar baja',
      message: `¿Seguro que deseas eliminar a <strong>${conductor.nombre}</strong> de tu flota?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sí, eliminar',
          role: 'destructive',
          handler: () => {
            // Llamamos a borrar enviando también quién lo solicita (para la API)
            this.eliminar(conductor.id, usuarioActual);
          }
        }
      ]
    });
    await alert.present();
  }

  eliminar(id: number, solicitante: string) {
    this.apiService.eliminarConductor(id, solicitante).subscribe({
      next: async () => {
        // Actualizamos la lista visualmente
        this.listaConductores = this.listaConductores.filter(c => c.id !== id);
        
        const toast = await this.toastController.create({
          message: 'Conductor eliminado correctamente.',
          duration: 2000,
          color: 'success',
          position: 'bottom',
          icon: 'trash-outline'
        });
        await toast.present();
      },
      error: async (err) => {
        console.error('Error eliminando:', err);
        
        // Manejo de error específico si la API rechaza (ej. 403 Forbidden)
        let mensaje = 'Error al eliminar. Intenta nuevamente.';
        if (err.status === 403) {
          mensaje = 'La API rechazó la eliminación: No eres el dueño.';
        }

        const toast = await this.toastController.create({
          message: mensaje,
          duration: 3000,
          color: 'danger',
          position: 'bottom'
        });
        await toast.present();
      }
    });
  }
}