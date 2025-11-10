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
  IonMenuButton,
  NavController
} from '@ionic/angular/standalone';
import { LottieComponent } from 'ngx-lottie';
import { addIcons } from 'ionicons';
import { mapOutline, albumsOutline, personCircleOutline, homeOutline, carOutline, logOutOutline } from 'ionicons/icons';

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
    IonMenuButton,
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
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ mapOutline, albumsOutline, personCircleOutline, homeOutline, carOutline, logOutOutline });
  }

  closeMenu() {
    this.menu.close();
  }

  async logout() {
    this.showLogoutOverlay = true;
    this.cdr.detectChanges(); 
    
    await this.menu.close();

    setTimeout(() => {
      this.showLogoutOverlay = false;
      this.cdr.detectChanges();
      this.navCtrl.navigateRoot('/login');
    }, 2500); 
  }
}