import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { DbtaskService } from '../services/dbtask';

export const authGuard: CanActivateFn = async (route, state) => {
  const dbtaskService = inject(DbtaskService);
  const router = inject(Router);

  const isAuthenticated = await dbtaskService.consultarSesionActiva();

  if (isAuthenticated) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};