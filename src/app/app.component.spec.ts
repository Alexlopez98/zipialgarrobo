import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick, flush } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { DbtaskService } from './services/dbtask'; 
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonMenu } from '@ionic/angular/standalone';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let navCtrlSpy: jasmine.SpyObj<NavController>;
  let dbtaskSpy: jasmine.SpyObj<DbtaskService>;

  beforeEach(waitForAsync(() => {
    const navSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);
    const dbSpy = jasmine.createSpyObj('DbtaskService', ['cerrarSesion']);

    TestBed.configureTestingModule({
      imports: [AppComponent], 
      providers: [
        { provide: NavController, useValue: navSpy },
        { provide: DbtaskService, useValue: dbSpy },
        provideRouter([]),
        provideLottieOptions({
          player: () => player,
        })
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA] 
    }).compileComponents();

    navCtrlSpy = TestBed.inject(NavController) as jasmine.SpyObj<NavController>;
    dbtaskSpy = TestBed.inject(DbtaskService) as jasmine.SpyObj<DbtaskService>;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    component.logoutAnimation = {
      animationData: { v: "5.5.7", fr: 60, ip: 0, op: 60, w: 500, h: 500, nm: "Test", layers: [] },
      loop: false,
      autoplay: true
    } as any; 
    fixture.detectChanges();


    component.menu = {
      close: jasmine.createSpy('close').and.returnValue(Promise.resolve()),
      toggle: jasmine.createSpy('toggle'),
      isOpen: jasmine.createSpy('isOpen').and.returnValue(Promise.resolve(false))
    } as unknown as IonMenu;
  });

  // --- PRUEBAS ---

  it('Debería crear la aplicación', () => {
    expect(component).toBeTruthy();
  });

  it('Debería cerrar el menú al llamar closeMenu()', () => {
    component.closeMenu();
    expect(component.menu.close).toHaveBeenCalled();
  });

  it('Debería ejecutar la secuencia de logout correctamente', fakeAsync(() => {
    dbtaskSpy.cerrarSesion.and.returnValue(Promise.resolve());

    component.logout();

    expect(component.showLogoutOverlay).toBeTrue();
    expect(component.menu.close).toHaveBeenCalled();

    tick(); 
    expect(dbtaskSpy.cerrarSesion).toHaveBeenCalled();

    tick(2500);

    expect(component.showLogoutOverlay).toBeFalse();
    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/login');
    
    flush(); 
  }));

  it('Debería navegar al login incluso si la BD falla', fakeAsync(() => {
    dbtaskSpy.cerrarSesion.and.returnValue(Promise.reject('Error de conexión'));

    component.logout();

    tick(); 
    tick(2500);

    expect(navCtrlSpy.navigateRoot).toHaveBeenCalledWith('/login');
    expect(component.showLogoutOverlay).toBeFalse();

    flush();
  }));
});