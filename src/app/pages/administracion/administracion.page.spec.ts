import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AdministracionPage } from './administracion.page';
import { IonicModule, NavController } from '@ionic/angular';
import { Router, ActivatedRoute, UrlTree } from '@angular/router'; 
import { By } from '@angular/platform-browser';

describe('AdministracionPage', () => {
  let component: AdministracionPage;
  let fixture: ComponentFixture<AdministracionPage>;

  beforeEach(waitForAsync(() => {
    const activatedRouteSpy = {
      snapshot: { paramMap: { get: () => null } }
    };

    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
    
    routerSpy.createUrlTree.and.returnValue(new UrlTree()); 
    routerSpy.serializeUrl.and.returnValue(''); 

    const navCtrlSpy = jasmine.createSpyObj('NavController', ['navigateForward', 'back']);

    TestBed.configureTestingModule({
      imports: [
        IonicModule.forRoot(),
        AdministracionPage
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NavController, useValue: navCtrlSpy } 
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdministracionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe renderizar 2 botones de navegación en las pestañas', () => {
    const tabButtons = fixture.debugElement.queryAll(By.css('ion-tab-button'));
    expect(tabButtons.length).toBe(2);
  });

  it('el botón Registrar debe apuntar a la ruta correcta', () => {
    const btnCrear = fixture.debugElement.query(By.css('ion-tab-button[tab="crear"]'));
    expect(btnCrear).toBeTruthy();
    expect(btnCrear.nativeElement.getAttribute('href')).toBe('/administracion/crear');
  });

  it('el botón Eliminar debe apuntar a la ruta correcta', () => {
    const btnEliminar = fixture.debugElement.query(By.css('ion-tab-button[tab="eliminar"]'));
    expect(btnEliminar).toBeTruthy();
    expect(btnEliminar.nativeElement.getAttribute('href')).toBe('/administracion/eliminar');
  });
});