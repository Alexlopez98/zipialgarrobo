import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { HomePage } from './home.page';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { DbtaskService } from '../../services/dbtask';
import { ApiConductoresService } from '../../services/api-conductores.service';
import { LottieComponent } from 'ngx-lottie';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  let dbTaskSpy: jasmine.SpyObj<DbtaskService>;
  let apiServiceSpy: jasmine.SpyObj<ApiConductoresService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    const spyDb = jasmine.createSpyObj('DbtaskService', ['obtenerUsuarioActivo', 'crearViaje']);
    const spyApi = jasmine.createSpyObj('ApiConductoresService', ['getConductores']);
    const spyRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), HomePage],
      providers: [
        { provide: DbtaskService, useValue: spyDb },
        { provide: ApiConductoresService, useValue: spyApi },
        { provide: Router, useValue: spyRouter }
      ]
    })
    .overrideComponent(HomePage, {
      remove: { imports: [LottieComponent] },
      add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
    })
    .compileComponents();

    dbTaskSpy = TestBed.inject(DbtaskService) as jasmine.SpyObj<DbtaskService>;
    apiServiceSpy = TestBed.inject(ApiConductoresService) as jasmine.SpyObj<ApiConductoresService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;

    spyOn(component, 'cargarMapa').and.callFake(() => console.log('Mapa simulado'));
    spyOn(component, 'fixLeafletIcons').and.callFake(() => {});

  }));

  it('should create', () => {
    fixture.detectChanges(); 
    expect(component).toBeTruthy();
  });

  // TEST 1: Carga inicial
  it('debe cargar el usuario y los conductores disponibles al entrar', fakeAsync(() => {
    const mockConductores = [{ id: 1, nombre: 'Juan', estado: 'Disponible' }];
    dbTaskSpy.obtenerUsuarioActivo.and.returnValue(Promise.resolve('UsuarioTest'));
    apiServiceSpy.getConductores.and.returnValue(of(mockConductores));

    fixture.detectChanges(); 
    component.ionViewWillEnter();
    tick();

    expect(component.usuario).toBe('UsuarioTest');
    expect(component.listaConductores.length).toBe(1);
  }));

  // TEST 2: Validación Destino
  it('debe mostrar una alerta si intentas viajar sin seleccionar destino', async () => {
    fixture.detectChanges();
    spyOn(window, 'alert');
    component.destinoSeleccionado = '';
    const conductor = { nombre: 'Juan' };

    await component.pedirViaje(conductor);

    expect(window.alert).toHaveBeenCalledWith('¡Primero selecciona un destino!');
    expect(component.cargando).toBeFalse();
  });

  // TEST 3: Flujo Pedir Viaje
  it('debe procesar el viaje, guardar en BD y mostrar animación', fakeAsync(() => {
    fixture.detectChanges();
    component.destinoSeleccionado = 'Playa Canelo';
    component.usuario = 'UsuarioTest';
    const conductor = { nombre: 'Chofer Pro' };
    dbTaskSpy.crearViaje.and.returnValue(Promise.resolve());

    component.pedirViaje(conductor);
    expect(component.cargando).toBeTrue();
    tick(2000);

    expect(component.mostrarAnimacion).toBeTrue();
    expect(dbTaskSpy.crearViaje).toHaveBeenCalledWith('UsuarioTest', 'Playa Canelo', 2500, 'Chofer Pro');
    tick(3000);
    expect(component.mostrarAnimacion).toBeFalse();
  }));

  // TEST 4: Geolocalización (CORREGIDO - Usando navigator)
  it('debe obtener la ubicación actual', async () => {
    const mockPosition = {
      coords: { latitude: -33.0, longitude: -71.0, accuracy: 100 }
    };

    spyOn(navigator.geolocation, 'getCurrentPosition').and.callFake((successCallback) => {
      successCallback(mockPosition as any);
    });

    await component.obtenerUbicacion();


    expect(component.ubicacionActual.latitude).toBe(-33.0);
    expect(component.ubicacionActual.longitude).toBe(-71.0);

    expect(component.cargarMapa).toHaveBeenCalledWith(-33.0, -71.0);
  });
});