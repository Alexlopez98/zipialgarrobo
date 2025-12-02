import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  NavController 
} from '@ionic/angular/standalone';
import { LottieComponent } from 'ngx-lottie';
import { addIcons } from 'ionicons';
import { mapOutline, albumsOutline, personCircleOutline, homeOutline, carOutline, logOutOutline } from 'ionicons/icons';
// Asegúrate de que la ruta sea correcta. A veces es .service
import { DbtaskService } from './services/dbtask'; 

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    CommonModule, 
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    LottieComponent 
  ],
})
export class AppComponent {
  @ViewChild('menu') menu!: IonMenu;
  showLogoutOverlay = false;

  logoutAnimation = {
    path: 'assets/animations/exit.json',
    loop: false,
    autoplay: true
  };

  constructor(
    private navCtrl: NavController,
    private cdr: ChangeDetectorRef,
    private dbtaskService: DbtaskService 
  ) {
    addIcons({ mapOutline, albumsOutline, personCircleOutline, homeOutline, carOutline, logOutOutline });
  }

  closeMenu() {
    this.menu.close();
  }

  async logout() {
    // 1. Mostrar la animación y cerrar menú visualmente
    this.showLogoutOverlay = true;
    this.cdr.detectChanges(); // Forzar actualización de vista para que salga el overlay
    await this.menu.close();

    // 2. Ejecutar la lógica de Base de Datos
    try {
      // Usamos la nueva función centralizada en el servicio
      await this.dbtaskService.cerrarSesion();
      console.log('Sesión cerrada correctamente en BD');
    } catch (error) {
      console.error('Error al cerrar sesión en BD:', error);
      // Aun si falla la BD, debemos permitir salir al usuario visualmente
    }

    // 3. Esperar a que termine la animación (2.5 segundos) y navegar
    setTimeout(() => {
      this.showLogoutOverlay = false;
      this.cdr.detectChanges();
      // Usamos navigateRoot para resetear la pila de navegación
      this.navCtrl.navigateRoot('/login'); 
    }, 2500); 
  }
}