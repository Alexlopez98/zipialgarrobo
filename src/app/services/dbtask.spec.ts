import { TestBed } from '@angular/core/testing';
import { DbtaskService } from './dbtask'; 
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular';

describe('DbtaskService', () => {
  let service: DbtaskService;
  let sqliteSpy: jasmine.SpyObj<SQLite>;
  let dbSpy: jasmine.SpyObj<SQLiteObject>;
  let storageSpy: jasmine.SpyObj<Storage>;
  let platformSpy: jasmine.SpyObj<Platform>;

  beforeEach(async () => {
    const spySqlite = jasmine.createSpyObj('SQLite', ['create']);
    const spyDb = jasmine.createSpyObj('SQLiteObject', ['executeSql']);
    const spyStorage = jasmine.createSpyObj('Storage', ['create', 'get', 'set', 'remove']);
    const spyPlatform = jasmine.createSpyObj('Platform', ['ready', 'is']);

    spyPlatform.is.withArgs('cordova').and.returnValue(false);
    spyPlatform.is.withArgs('capacitor').and.returnValue(false);
    spyPlatform.ready.and.returnValue(Promise.resolve('ready'));
    
    spySqlite.create.and.returnValue(Promise.resolve(spyDb));

    spyStorage.create.and.returnValue(Promise.resolve(spyStorage));
    spyStorage.get.and.returnValue(Promise.resolve([])); 
    spyStorage.set.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [
        DbtaskService,
        { provide: SQLite, useValue: spySqlite },
        { provide: Storage, useValue: spyStorage },
        { provide: Platform, useValue: spyPlatform }
      ]
    });

    service = TestBed.inject(DbtaskService);
    
    sqliteSpy = TestBed.inject(SQLite) as jasmine.SpyObj<SQLite>;
    dbSpy = spyDb;
    storageSpy = TestBed.inject(Storage) as jasmine.SpyObj<Storage>;
    platformSpy = TestBed.inject(Platform) as jasmine.SpyObj<Platform>;

    await service.inicializarBD(); 
  });

  // --- PRUEBAS ---

  it('Debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('Debería validar un usuario existente', async () => {
    // Simulamos que ya existe un usuario en el Storage
    const usuariosMock = [{ user_name: 'juan', password: 'abc', active: 0 }];
    storageSpy.get.and.returnValue(Promise.resolve(usuariosMock));

    const resultado = await service.validarUsuario('juan', 'abc');

    // Debe usar Storage, no SQLite
    expect(storageSpy.get).toHaveBeenCalled();
    expect(dbSpy.executeSql).not.toHaveBeenCalled();
    expect(resultado.rows.length).toBe(1);
  });

  it('Debería registrar un usuario correctamente (Simulación Web)', async () => {
    storageSpy.get.and.returnValue(Promise.resolve([])); 
    
    await service.registrarUsuario('testuser', '1234');

    expect(storageSpy.set).toHaveBeenCalled();
    expect(dbSpy.executeSql).not.toHaveBeenCalled();
  });

  it('Debería crear un viaje y guardarlo', async () => {
    storageSpy.get.and.returnValue(Promise.resolve([]));
    
    await service.crearViaje('juan', 'Santiago', 10000, 'Chofer01');

    expect(storageSpy.set).toHaveBeenCalled();
    expect(dbSpy.executeSql).not.toHaveBeenCalled();
  });

  it('Debería cerrar sesión correctamente', async () => {
    const usuariosConActivo = [
      { user_name: 'pedro', password: '123', active: 1 }
    ];
    storageSpy.get.and.returnValue(Promise.resolve(usuariosConActivo));
    
    await service.cerrarSesion();

    expect(storageSpy.set).toHaveBeenCalled();
    expect(dbSpy.executeSql).not.toHaveBeenCalled();
  });
});