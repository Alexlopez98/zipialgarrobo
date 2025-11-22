import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class DbtaskService {
  public database!: SQLiteObject;
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private isWeb: boolean = false;
  
  private tablaSesion: string = "CREATE TABLE IF NOT EXISTS sesion_data (user_name TEXT PRIMARY KEY NOT NULL, password INTEGER NOT NULL, active INTEGER NOT NULL);";
  private tablaViajes: string = "CREATE TABLE IF NOT EXISTS viajes (id INTEGER PRIMARY KEY AUTOINCREMENT, user_name TEXT NOT NULL, destino TEXT NOT NULL, fecha TEXT NOT NULL, costo INTEGER NOT NULL, estado TEXT NOT NULL, conductor TEXT);";

  constructor(
    private platform: Platform, 
    private sqlite: SQLite,
    private storage: Storage
  ) {
    this.isWeb = !this.platform.is('capacitor') && !this.platform.is('cordova');
    this.crearBD();
  }

  async crearBD() {
    await this.storage.create();
    
    this.platform.ready().then(() => {
      if (this.isWeb) {
        this.isDbReady.next(true);
        return;
      }
      this.sqlite.create({
        name: 'zipialgarrobo.db',
        location: 'default'
      })
      .then((db: SQLiteObject) => {
        this.database = db;
        this.crearTablas();
      })
      .catch(e => console.error('Error al crear BD SQLite', e));
    });
  }

  async crearTablas() {
    try {
      await this.database.executeSql(this.tablaSesion, []);
      await this.database.executeSql(this.tablaViajes, []); 
      this.isDbReady.next(true);
    } catch (e) {
      console.error("Error creando tablas", e);
    }
  }


  async validarUsuario(user: string, pass: number) {
    if (this.isWeb) {
      const usuarios = await this.storage.get('sesion_data_web') || [];
      const encontrado = usuarios.find((u: any) => u.user_name === user && u.password === pass);
      return Promise.resolve({ rows: { length: encontrado ? 1 : 0 } });
    }
    return this.database.executeSql('SELECT * FROM sesion_data WHERE user_name = ? AND password = ?', [user, pass]);
  }

  async registrarUsuario(user: string, pass: number) {
    if (this.isWeb) {
      let usuarios = await this.storage.get('sesion_data_web') || [];
      if (usuarios.find((u: any) => u.user_name === user)) return Promise.reject('Usuario existe');
      usuarios.push({ user_name: user, password: pass, active: 1 });
      await this.storage.set('sesion_data_web', usuarios);
      return Promise.resolve();
    }
    let data = [user, pass, 1];
    return this.database.executeSql('INSERT INTO sesion_data(user_name, password, active) VALUES(?, ?, ?)', data);
  }

  async actualizarSesion(user: string, active: number) {
    if (this.isWeb) {
      let usuarios = await this.storage.get('sesion_data_web') || [];
      const index = usuarios.findIndex((u: any) => u.user_name === user);
      if (index > -1) {
        usuarios[index].active = active;
        await this.storage.set('sesion_data_web', usuarios);
      }
      return Promise.resolve();
    }
    return this.database.executeSql('UPDATE sesion_data SET active = ? WHERE user_name = ?', [active, user]);
  }

  async consultarSesionActiva() {
    if (this.isWeb) {
      const usuarios = await this.storage.get('sesion_data_web') || [];
      return Promise.resolve(usuarios.some((u: any) => u.active === 1));
    }
    return this.database.executeSql('SELECT * FROM sesion_data WHERE active = 1', [])
      .then(res => res.rows.length > 0);
  }

  async obtenerUsuarioActivo() {
    if (this.isWeb) {
      const usuarios = await this.storage.get('sesion_data_web') || [];
      const usuario = usuarios.find((u: any) => u.active === 1);
      return usuario ? usuario.user_name : null;
    }
    return this.database.executeSql('SELECT user_name FROM sesion_data WHERE active = 1', [])
      .then(res => (res.rows.length > 0 ? res.rows.item(0).user_name : null));
  }


  async crearViaje(usuario: string, destino: string, costo: number, conductor: string) {
    const fecha = new Date().toLocaleString(); 
    const estado = 'Completado';

    if (this.isWeb) {
      const viajes = await this.storage.get('viajes_data_web') || [];
      viajes.push({ usuario, destino, fecha, costo, estado, conductor });
      return await this.storage.set('viajes_data_web', viajes);
    }

    const data = [usuario, destino, fecha, costo, estado, conductor];
    return this.database.executeSql('INSERT INTO viajes(user_name, destino, fecha, costo, estado, conductor) VALUES(?, ?, ?, ?, ?, ?)', data);
  }

  async obtenerViajes(usuario: string) {
    if (this.isWeb) {
      const viajes = await this.storage.get('viajes_data_web') || [];
      return viajes.filter((v: any) => v.usuario === usuario);
    }

    return this.database.executeSql('SELECT * FROM viajes WHERE user_name = ? ORDER BY id DESC', [usuario])
      .then(res => {
        let items = [];
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            items.push({
              id: res.rows.item(i).id,
              usuario: res.rows.item(i).user_name,
              destino: res.rows.item(i).destino,
              fecha: res.rows.item(i).fecha,
              costo: res.rows.item(i).costo,
              estado: res.rows.item(i).estado,
              conductor: res.rows.item(i).conductor 
            });
          }
        }
        return items;
      });
  }

  async eliminarHistorial(usuario: string) {
    if (this.isWeb) {
      const viajes = await this.storage.get('viajes_data_web') || [];
      const nuevosViajes = viajes.filter((v: any) => v.usuario !== usuario);
      return await this.storage.set('viajes_data_web', nuevosViajes);
    }
    return this.database.executeSql('DELETE FROM viajes WHERE user_name = ?', [usuario]);
  }
}