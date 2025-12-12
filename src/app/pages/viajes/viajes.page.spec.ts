import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { ViajesPage } from './viajes.page';
import { IonicModule, AlertController, NavController } from '@ionic/angular';
import { DbtaskService } from '../../services/dbtask';
import { ApiConductoresService } from 'src/app/services/api-conductores.service';
import { LottieComponent } from 'ngx-lottie';
import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';

describe('ViajesPage', () => {
  let component: ViajesPage;
  let fixture: ComponentFixture<ViajesPage>;
  let dbTaskSpy: jasmine.SpyObj<DbtaskService>;
  let apiServiceSpy: jasmine.SpyObj<ApiConductoresService>;
  let alertCtrlSpy: jasmine.SpyObj<AlertController>;
  let navControllerSpy: jasmine.SpyObj<NavController>;

  beforeEach(waitForAsync(() => {
    const spyDb = jasmine.createSpyObj('DbtaskService', ['obtenerUsuarioActivo', 'obtenerViajes', 'actualizarCalificacionViaje', 'eliminarHistorial']);
    const spyApi = jasmine.createSpyObj('ApiConductoresService', ['getConductores', 'calificarConductor']);
    const spyAlert = jasmine.createSpyObj('AlertController', ['create']);
    const spyNav = jasmine.createSpyObj('NavController', ['navigateForward', 'back']); 

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        ViajesPage 
      ],
      providers: [
        { provide: DbtaskService, useValue: spyDb },
        { provide: ApiConductoresService, useValue: spyApi },
        { provide: AlertController, useValue: spyAlert },
        { provide: NavController, useValue: spyNav }, 
        ChangeDetectorRef 
      ]
    })
    .overrideComponent(ViajesPage, {
      remove: { imports: [LottieComponent] },
      add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
    })
    .compileComponents();

    dbTaskSpy = TestBed.inject(DbtaskService) as jasmine.SpyObj<DbtaskService>;
    apiServiceSpy = TestBed.inject(ApiConductoresService) as jasmine.SpyObj<ApiConductoresService>;
    alertCtrlSpy = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
    navControllerSpy = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;

    fixture = TestBed.createComponent(ViajesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TEST 1: Cargar Viajes
  it('debe cargar los viajes del usuario al entrar', fakeAsync(() => {
    const mockViajes = [
      { id: 1, destino: 'Playa', costo: 5000, conductor: 'Juan', calificado: false }
    ];

    dbTaskSpy.obtenerUsuarioActivo.and.returnValue(Promise.resolve('usuario_test'));
    dbTaskSpy.obtenerViajes.and.returnValue(Promise.resolve(mockViajes));

    component.ionViewWillEnter();
    tick(); 

    expect(dbTaskSpy.obtenerUsuarioActivo).toHaveBeenCalled();
    expect(dbTaskSpy.obtenerViajes).toHaveBeenCalledWith('usuario_test');
    expect(component.viajes.length).toBe(1);
    expect(component.viajes[0].destino).toBe('Playa');
  }));

  // TEST 2: Calificar Viaje
  it('debe guardar la calificación localmente y en la API', fakeAsync(() => {
    const viajeTest = { id: 1, conductor: 'Juan', calificado: false };
    const conductoresApi = [{ id: 99, nombre: 'Juan' }]; 

    dbTaskSpy.actualizarCalificacionViaje.and.returnValue(Promise.resolve());
    apiServiceSpy.getConductores.and.returnValue(of(conductoresApi));
    apiServiceSpy.calificarConductor.and.returnValue(of({ success: true }));

    component.calificar(viajeTest, 5);
    
    expect(component.mostrarAnimacion).toBeTrue();
    expect(viajeTest.calificado).toBeTrue();

    tick(6000); 

    expect(component.mostrarAnimacion).toBeFalse();
    expect(apiServiceSpy.calificarConductor).toHaveBeenCalledWith(99, 5);
  }));

  // TEST 3: Limpiar Historial (Simulando click en "Sí")
  it('debe borrar el historial cuando el usuario confirma la alerta', fakeAsync(async () => {
    component.viajes = [{ id: 1 }, { id: 2 }]; 
    component.usuarioActivo = 'user1';

    const alertSpyObj = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
    alertCtrlSpy.create.and.returnValue(Promise.resolve(alertSpyObj));
    dbTaskSpy.eliminarHistorial.and.returnValue(Promise.resolve());

    await component.limpiarHistorial();
    tick();

    const callArgs = alertCtrlSpy.create.calls.mostRecent().args;
    
    const alertConfig: any = callArgs[0]; 
    
    const botonSi = alertConfig.buttons.find((b: any) => b.text === 'Sí, limpiar');

    await botonSi.handler();
    tick(); 

    expect(dbTaskSpy.eliminarHistorial).toHaveBeenCalledWith('user1');
    expect(component.viajes.length).toBe(0); 
  }));
});