import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.page').then(m => m.RegistroPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage),
    canActivate: [authGuard]
  },
  {
    path: 'viajes',
    loadComponent: () => import('./pages/viajes/viajes.page').then(m => m.ViajesPage),
    canActivate: [authGuard]
  },

  {
    path: 'administracion',
    loadComponent: () => import('./pages/administracion/administracion.page').then( m => m.AdministracionPage),
    canActivate: [authGuard], 
    children: [
      {
        path: 'crear', 
        loadComponent: () => import('./pages/registro-conductor/registro-conductor.page').then( m => m.RegistroConductorPage)
      },
      {
        path: 'eliminar', 
        loadComponent: () => import('./pages/eliminar-conductor/eliminar-conductor.page').then( m => m.EliminarConductorPage)
      },
      {
        path: '',
        redirectTo: 'crear', 
        pathMatch: 'full'
      }
    ]
  },

  {
    path: 'error404',
    loadComponent: () => import('./pages/error404/error404.page').then(m => m.Error404Page),
  },
  { path: '**', redirectTo: 'error404' },
];