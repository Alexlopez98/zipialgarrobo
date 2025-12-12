import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RegistroPage } from './registro.page';
import { DbtaskService } from '../../services/dbtask'; 
import { Router } from '@angular/router';
import { IonicModule, ToastController, NavController } from '@ionic/angular'; 
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router'; 

describe('RegistroPage', () => {
  let component: RegistroPage;
  let fixture: ComponentFixture<RegistroPage>;
  let dbtaskSpy: jasmine.SpyObj<DbtaskService>;
  let toastCtrlSpy: jasmine.SpyObj<ToastController>;
  let toastSpy: jasmine.SpyObj<HTMLIonToastElement>;
  let router: Router; 

  beforeEach(waitForAsync(() => {
    const dbSpy = jasmine.createSpyObj('DbtaskService', ['registrarUsuario', 'actualizarSesion']);
    const tCtrlSpy = jasmine.createSpyObj('ToastController', ['create']);
    const tSpy = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    const navSpy = jasmine.createSpyObj('NavController', ['navigateForward', 'navigateRoot', 'back']);

    tCtrlSpy.create.and.returnValue(Promise.resolve(tSpy));

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        RegistroPage 
      ],
      providers: [
        provideRouter([]), 
        { provide: DbtaskService, useValue: dbSpy },
        { provide: ToastController, useValue: tCtrlSpy },
        { provide: NavController, useValue: navSpy } 
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    dbtaskSpy = TestBed.inject(DbtaskService) as jasmine.SpyObj<DbtaskService>;
    toastCtrlSpy = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
    toastSpy = tSpy;
    
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --- PRUEBAS ---

  it('Debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('Debería mostrar un Toast de advertencia si los campos están vacíos', async () => {
    component.usuario = '';
    component.password = '';

    await component.registrar();

    expect(toastCtrlSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      color: 'warning'
    }));
    expect(toastSpy.present).toHaveBeenCalled();
    expect(dbtaskSpy.registrarUsuario).not.toHaveBeenCalled();
  });

  it('Debería mostrar error si la contraseña no tiene 4 números', async () => {
    component.usuario = 'pedro';
    component.password = 'abc'; 

    await component.registrar();

    expect(toastCtrlSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      color: 'danger',
      message: jasmine.stringMatching(/contraseña debe ser/i)
    }));
    expect(dbtaskSpy.registrarUsuario).not.toHaveBeenCalled();
  });

  it('Debería registrar exitosamente, iniciar sesión y navegar al home', async () => {
    // Datos válidos
    component.usuario = 'nuevoUsuario';
    component.password = '1234';

    dbtaskSpy.registrarUsuario.and.returnValue(Promise.resolve());
    dbtaskSpy.actualizarSesion.and.returnValue(Promise.resolve());

    // Ejecutar
    await component.registrar();

    // Verificaciones
    expect(dbtaskSpy.registrarUsuario).toHaveBeenCalledWith('nuevoUsuario', '1234');
    expect(dbtaskSpy.actualizarSesion).toHaveBeenCalledWith('nuevoUsuario', 1);
    
    expect(toastCtrlSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      color: 'success'
    }));

    expect(router.navigate).toHaveBeenCalledWith(['/home']);
    expect(component.cargando).toBeFalse();
  });

  it('Debería manejar el error si el usuario ya existe', async () => {
    // Datos
    component.usuario = 'usuarioExistente';
    component.password = '1234';

    dbtaskSpy.registrarUsuario.and.returnValue(Promise.reject('Usuario ya existe'));

    await component.registrar();

    // Verificaciones
    expect(dbtaskSpy.registrarUsuario).toHaveBeenCalled();
    expect(dbtaskSpy.actualizarSesion).not.toHaveBeenCalled();
    
    expect(toastCtrlSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      color: 'danger',
      message: jasmine.stringMatching(/ya existe/i)
    }));

    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.cargando).toBeFalse();
  });
});