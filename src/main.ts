import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web'; 
import { addIcons } from 'ionicons';
import {
  menuOutline,
  personOutline,
  carOutline,
  logOutOutline,
  arrowBackOutline,
  homeOutline,
} from 'ionicons/icons';

addIcons({ menuOutline, personOutline, carOutline, logOutOutline, arrowBackOutline,homeOutline });

bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular({}),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),

    provideLottieOptions({
      player: () => player,
    }),
  ],
});
