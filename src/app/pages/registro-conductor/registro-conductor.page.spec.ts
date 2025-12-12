import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { RegistroConductorPage } from './registro-conductor.page';
import { IonicModule, ToastController, NavController } from '@ionic/angular'; 
import { Router } from '@angular/router';
import { ApiConductoresService } from 'src/app/services/api-conductores.service';
import { DbtaskService } from '../../services/dbtask'; 
import { of, throwError } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('RegistroConductorPage', () => {
  let component: RegistroConductorPage;
  let fixture: ComponentFixture<RegistroConductorPage>;
  let apiServiceSpy: jasmine.SpyObj<ApiConductoresService>;
  let dbTaskServiceSpy: jasmine.SpyObj<DbtaskService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let navControllerSpy: jasmine.SpyObj<NavController>; 

  beforeEach(waitForAsync(() => {
    const spyApi = jasmine.createSpyObj('ApiConductoresService', ['getConductorPorUsuario', 'agregarConductor']);
    const spyDb = jasmine.createSpyObj('DbtaskService', ['obtenerUsuarioActivo']);
    const spyRouter = jasmine.createSpyObj('Router', ['navigate']);
    const spyToast = jasmine.createSpyObj('ToastController', ['create']);
    const spyNav = jasmine.createSpyObj('NavController', ['navigateForward', 'back']);

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(), 
        BrowserAnimationsModule,
        RegistroConductorPage 
      ],
      providers: [
        { provide: ApiConductoresService, useValue: spyApi },
        { provide: DbtaskService, useValue: spyDb },
        { provide: Router, useValue: spyRouter },
        { provide: ToastController, useValue: spyToast },
        { provide: NavController, useValue: spyNav } 
      ]
    }).compileComponents();

    apiServiceSpy = TestBed.inject(ApiConductoresService) as jasmine.SpyObj<ApiConductoresService>;
    dbTaskServiceSpy = TestBed.inject(DbtaskService) as jasmine.SpyObj<DbtaskService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    toastControllerSpy = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
    navControllerSpy = TestBed.inject(NavController) as jasmine.SpyObj<NavController>; 

    fixture = TestBed.createComponent(RegistroConductorPage);
    component = fixture.componentInstance;
    
    component.crearGrafico = () => { console.log('Simulando gráfico...'); };

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TEST 1: Usuario NO es conductor
  it('debe identificar que el usuario NO es conductor y preparar el formulario', fakeAsync(() => {
    dbTaskServiceSpy.obtenerUsuarioActivo.and.returnValue(Promise.resolve('juan.perez'));
    apiServiceSpy.getConductorPorUsuario.and.returnValue(throwError(() => new Error('No encontrado')));

    component.ionViewWillEnter(); 
    tick(); 

    expect(dbTaskServiceSpy.obtenerUsuarioActivo).toHaveBeenCalled();
    expect(apiServiceSpy.getConductorPorUsuario).toHaveBeenCalledWith('juan.perez');
    expect(component.esConductor).toBeFalse(); 
    expect(component.conductor.propietario).toBe('juan.perez'); 
  }));

  // TEST 2: Registro exitoso
  it('debe registrar el conductor y mostrar toast de éxito', fakeAsync(async () => {
    component.conductor.nombre = 'Juan Perez';
    component.conductor.vehiculo = 'Chevrolet Spark';
    component.conductor.patente = 'XYZ-123';

    apiServiceSpy.agregarConductor.and.returnValue(of({ success: true }));

    const toastHTML = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    toastControllerSpy.create.and.returnValue(Promise.resolve(toastHTML));

    component.registrar();
    tick(); 

    expect(apiServiceSpy.agregarConductor).toHaveBeenCalledWith(component.conductor);
    expect(toastControllerSpy.create).toHaveBeenCalled(); 
  }));
});