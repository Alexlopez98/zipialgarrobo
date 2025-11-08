import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./pages/perfil/perfil.page').then((m) => m.PerfilPage),
  },
  {
    path: 'viajes',
    loadComponent: () =>
      import('./pages/viajes/viajes.page').then((m) => m.ViajesPage),
  },
  {
    path: 'error404',
    loadComponent: () =>
      import('./pages/error404/error404.page').then((m) => m.Error404Page),
  },
  { path: '**', redirectTo: 'error404' },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then( m => m.PerfilPage)
  },
];
