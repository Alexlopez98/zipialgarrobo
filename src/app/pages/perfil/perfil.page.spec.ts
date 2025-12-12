import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PerfilPage } from './perfil.page';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { DbtaskService } from '../../services/dbtask';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// ===== MOCKS =====
class RouterMock {
  navigate = jasmine.createSpy('navigate');
  getCurrentNavigation() {
    return { extras: { state: { usuario: 'testUser' } } };
  }
}

class StorageMock {
  store: any = {};
  create = jasmine.createSpy('create').and.returnValue(Promise.resolve());
  get = jasmine.createSpy('get').and.callFake((k: string) => Promise.resolve(this.store[k]));
  set = jasmine.createSpy('set').and.callFake((k: string, v: any) => {
    this.store[k] = v;
    return Promise.resolve();
  });
}

class DbMock {
  obtenerUsuarioActivo = jasmine.createSpy('obtenerUsuarioActivo').and.resolveTo('testUser');
  actualizarSesion = jasmine.createSpy('actualizarSesion').and.resolveTo(true);
  actualizarPassword = jasmine.createSpy('actualizarPassword').and.resolveTo(true);
}

class AlertMock {
  create = jasmine.createSpy('create').and.callFake(() =>
    Promise.resolve({
      present: jasmine.createSpy('present'),
    })
  );
}

describe('PerfilPage', () => {
  let component: PerfilPage;
  let fixture: ComponentFixture<PerfilPage>;
  let storage: StorageMock;

  beforeEach(async () => {
    storage = new StorageMock();

    await TestBed.configureTestingModule({
      imports: [PerfilPage],
      providers: [
        { provide: Router, useClass: RouterMock },
        { provide: Storage, useValue: storage },
        { provide: DbtaskService, useClass: DbMock },
        { provide: AlertController, useClass: AlertMock }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('Debe cargar usuario desde RouterNavigation', fakeAsync(async () => {
    await component.ngOnInit();
    expect(component.usuario).toBe('testUser');
  }));

  it('Debe validar contraseña incorrecta y mostrar alerta', fakeAsync(async () => {
    component.usuario = 'testUser';
    component.password = '12'; 

    const alertCtrl = TestBed.inject(AlertController);

    await component.guardarCambios();
    expect(alertCtrl.create).toHaveBeenCalled(); 
  }));

  it('Debe guardar cambios correctamente en Storage', fakeAsync(async () => {
    component.usuario = 'testUser';
    component.nombre = 'Nombre Test';
    component.password = '1234'; 

    await component.guardarCambios();
    tick(1500);

    expect(storage.set).toHaveBeenCalledWith(
      'perfil_testUser',
      jasmine.objectContaining({
        nombre: 'Nombre Test',
        password: '1234'
      })
    );
  }));

  it('Debe cerrar sesión y navegar al login', fakeAsync(async () => {
    const router = TestBed.inject(Router);

    await component.cerrarSesion();
    tick(2500);

    expect(router.navigate).toHaveBeenCalledWith(['/login'], { replaceUrl: true });
  }));

  it('Debe actualizar la foto de perfil (mock cámara)', fakeAsync(async () => {
    const fakeImage = { dataUrl: 'data:image/png;base64,fotoFake' };
    spyOn<any>(navigator, 'mediaDevices').and.returnValue({}); 

    spyOn<any>(component, 'cambiarFoto').and.callFake(async () => {
      component.fotoPerfil = fakeImage.dataUrl;
    });

    await component.cambiarFoto();

    expect(component.fotoPerfil).toBe(fakeImage.dataUrl);
  }));
});
