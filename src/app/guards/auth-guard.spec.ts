import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth-guard'; 
import { DbtaskService } from '../services/dbtask'; 

describe('AuthGuard', () => {
  let dbtaskSpy: jasmine.SpyObj<DbtaskService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    dbtaskSpy = jasmine.createSpyObj('DbtaskService', ['consultarSesionActiva']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: DbtaskService, useValue: dbtaskSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('Debería PERMITIR el acceso (return true) si la sesión está activa', async () => {
    dbtaskSpy.consultarSesionActiva.and.returnValue(Promise.resolve(true));

    const resultado = await TestBed.runInInjectionContext(() => 
      authGuard({} as any, {} as any) 
    );

    expect(resultado).toBe(true);
    expect(routerSpy.navigate).not.toHaveBeenCalled(); 
  });

  it('Debería BLOQUEAR el acceso (return false) y redirigir al login si no hay sesión', async () => {
    dbtaskSpy.consultarSesionActiva.and.returnValue(Promise.resolve(false));

    const resultado = await TestBed.runInInjectionContext(() => 
      authGuard({} as any, {} as any)
    );

    expect(resultado).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']); 
  });
});