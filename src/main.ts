import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, RouteReuseStrategy, withPreloading, PreloadAllModules } from '@angular/router';
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
  mapOutline,
  albumsOutline,
  personCircleOutline
} from 'ionicons/icons';
import { Drivers, Storage } from '@ionic/storage';
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';

addIcons({ 
  menuOutline, personOutline, carOutline, logOutOutline, arrowBackOutline, 
  homeOutline, mapOutline, albumsOutline, personCircleOutline 
});

bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular({ mode: 'md' }),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideAnimations(),

    provideLottieOptions({
      player: () => player,
    }),
    {
      provide: Storage,
      useFactory: () => {
        const storage = new Storage({
          name: '__zipiDB',
          driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
        });
        storage.create();
        return storage;
      }
    },
    SQLite
  ],
});