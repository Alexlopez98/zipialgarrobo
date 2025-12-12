import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { DbtaskService } from '../../services/dbtask'; 
import { Router } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let dbtaskSpy: jasmine.SpyObj<DbtaskService>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let router: Router; 

  beforeEach(waitForAsync(() => {
    const dbSpy = jasmine.createSpyObj('DbtaskService', ['dbState', 'validarUsuario', 'actualizarSesion']);
    const navSpy = jasmine.createSpyObj('NavController', ['navigateForward', 'navigateRoot', 'back']);

    dbSpy.dbState.and.returnValue(of(true));

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        LoginPage 
      ],
      providers: [
        provideRouter([]), 
        { provide: DbtaskService, useValue: dbSpy },
        { provide: NavController, useValue: navSpy } 
      ]
    }).compileComponents();

    dbtaskSpy = TestBed.inject(DbtaskService) as jasmine.SpyObj<DbtaskService>;
    navCtrlSpy = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
    
    router = TestBed.inject(Router);
    spyOn(router, 'navigate'); 
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --- PRUEBAS ---

  it('Debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('Debería inicializar isDbReady en true', () => {
    expect(component.isDbReady).toBeTrue();
  });

  it('Debería mostrar error si la BD no está lista', async () => {
    component.isDbReady = false;
    await component.login();
    expect(component.error).toContain('Cargando base de datos');
    expect(dbtaskSpy.validarUsuario).not.toHaveBeenCalled();
  });

  it('Debería validar que los campos no estén vacíos', async () => {
    component.usuario = '';
    component.password = '';
    component.isDbReady = true;

    await component.login();

    expect(component.error).toContain('ingresa tus credenciales');
    expect(dbtaskSpy.validarUsuario).not.toHaveBeenCalled();
  });

  it('Debería navegar al home si las credenciales son correctas', async () => {
    // Datos
    component.usuario = 'conductor';
    component.password = '1234';
    component.isDbReady = true;

    // Simular éxito en BD
    dbtaskSpy.validarUsuario.and.returnValue(Promise.resolve({ rows: { length: 1 } } as any));
    dbtaskSpy.actualizarSesion.and.returnValue(Promise.resolve());

    // Acción
    await component.login();

    // Validación
    expect(dbtaskSpy.validarUsuario).toHaveBeenCalledWith('conductor', '1234');
    expect(dbtaskSpy.actualizarSesion).toHaveBeenCalledWith('conductor', 1);
    
    // Verificamos el espía sobre el router real
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
    expect(component.error).toBe('');
  });

  it('Debería mostrar error si las credenciales son incorrectas', async () => {
    // Datos
    component.usuario = 'falso';
    component.password = '0000';
    component.isDbReady = true;

    // Simular fallo en BD (0 filas)
    dbtaskSpy.validarUsuario.and.returnValue(Promise.resolve({ rows: { length: 0 } } as any));

    // Acción
    await component.login();

    // Validación
    expect(dbtaskSpy.actualizarSesion).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.error).toContain('Usuario o contraseña incorrectos');
  });

  it('Debería manejar errores técnicos', async () => {
    component.usuario = 'test';
    component.password = '1234';
    component.isDbReady = true;

    // Simular error
    dbtaskSpy.validarUsuario.and.returnValue(Promise.reject('Error DB'));

    await component.login();

    expect(component.error).toContain('Error técnico');
  });
});