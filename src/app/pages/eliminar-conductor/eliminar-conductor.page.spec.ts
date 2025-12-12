import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { EliminarConductorPage } from './eliminar-conductor.page';
import { IonicModule, AlertController, ToastController, NavController } from '@ionic/angular';
import { ApiConductoresService } from '../../services/api-conductores.service';
import { DbtaskService } from '../../services/dbtask';
import { of, throwError } from 'rxjs';

describe('EliminarConductorPage', () => {
  let component: EliminarConductorPage;
  let fixture: ComponentFixture<EliminarConductorPage>;

  let apiServiceSpy: jasmine.SpyObj<ApiConductoresService>;
  let dbTaskSpy: jasmine.SpyObj<DbtaskService>;
  let alertCtrlSpy: jasmine.SpyObj<AlertController>;
  let toastCtrlSpy: jasmine.SpyObj<ToastController>;
  let navControllerSpy: jasmine.SpyObj<NavController>;

  beforeEach(waitForAsync(() => {
    const spyApi = jasmine.createSpyObj('ApiConductoresService', ['getConductores', 'eliminarConductor']);
    const spyDb = jasmine.createSpyObj('DbtaskService', ['obtenerUsuarioActivo']);
    const spyAlert = jasmine.createSpyObj('AlertController', ['create']);
    const spyToast = jasmine.createSpyObj('ToastController', ['create']);
    const spyNav = jasmine.createSpyObj('NavController', ['navigateForward', 'back']);

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        EliminarConductorPage 
      ],
      providers: [
        { provide: ApiConductoresService, useValue: spyApi },
        { provide: DbtaskService, useValue: spyDb },
        { provide: AlertController, useValue: spyAlert },
        { provide: ToastController, useValue: spyToast },
        { provide: NavController, useValue: spyNav } 
      ]
    }).compileComponents();

    apiServiceSpy = TestBed.inject(ApiConductoresService) as jasmine.SpyObj<ApiConductoresService>;
    dbTaskSpy = TestBed.inject(DbtaskService) as jasmine.SpyObj<DbtaskService>;
    alertCtrlSpy = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;
    toastCtrlSpy = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;

    fixture = TestBed.createComponent(EliminarConductorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // TEST 1: Cargar conductores al entrar
  it('debe cargar la lista de conductores al iniciar', () => {
    const mockData = [{ id: 1, nombre: 'Juan', propietario: 'user1' }];
    apiServiceSpy.getConductores.and.returnValue(of(mockData));

    component.ionViewWillEnter();

    expect(apiServiceSpy.getConductores).toHaveBeenCalled();
    expect(component.listaConductores.length).toBe(1);
    expect(component.listaConductores[0].nombre).toBe('Juan');
  });

  // TEST 2: Intentar eliminar SIN ser propietario (Acceso Denegado)
  it('debe mostrar alerta de Acceso Denegado si el usuario no es el dueño', fakeAsync(async () => {
    const conductorAjeno = { id: 2, nombre: 'Pedro', propietario: 'otro_usuario' };
    
    dbTaskSpy.obtenerUsuarioActivo.and.returnValue(Promise.resolve('mi_usuario'));
    
    const alertSpyObj = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
    alertCtrlSpy.create.and.returnValue(Promise.resolve(alertSpyObj));

    await component.confirmarEliminacion(conductorAjeno);
    tick();

    const callArgs = alertCtrlSpy.create.calls.mostRecent().args;
    const alertConfig: any = callArgs[0];

    expect(alertConfig.header).toBe('Acceso Denegado'); 
    expect(alertSpyObj.present).toHaveBeenCalled();
  }));

  // TEST 3: Eliminar exitosamente (Siendo dueño)
  it('debe eliminar el conductor si el usuario confirma y es el dueño', fakeAsync(async () => {
    const miConductor = { id: 10, nombre: 'Juan', propietario: 'yo_mismo' };
    component.listaConductores = [miConductor]; 

    dbTaskSpy.obtenerUsuarioActivo.and.returnValue(Promise.resolve('yo_mismo')); 
    
    apiServiceSpy.eliminarConductor.and.returnValue(of({ success: true }));

    const alertSpyObj = jasmine.createSpyObj('HTMLIonAlertElement', ['present']);
    const toastSpyObj = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    
    alertCtrlSpy.create.and.returnValue(Promise.resolve(alertSpyObj));
    toastCtrlSpy.create.and.returnValue(Promise.resolve(toastSpyObj));

    await component.confirmarEliminacion(miConductor);
    tick();

    const callArgs = alertCtrlSpy.create.calls.mostRecent().args;
    const alertConfig: any = callArgs[0];
    const botonSi = alertConfig.buttons.find((b: any) => b.text === 'Sí, eliminar');
    
    await botonSi.handler();
    tick(); 

    expect(apiServiceSpy.eliminarConductor).toHaveBeenCalledWith(10, 'yo_mismo');
    expect(toastCtrlSpy.create).toHaveBeenCalled(); 
    expect(component.listaConductores.length).toBe(0); 
  }));
});