import { Component, OnInit, ViewChild } from '@angular/core'; // 1. Importar ViewChild
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; // 2. Importar NgForm
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { DbtaskService } from '../../services/dbtask';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink]
})
export class LoginPage implements OnInit, ViewWillEnter {
  
  // 3. Referencia al formulario del HTML (#loginForm="ngForm")
  @ViewChild('loginForm') loginForm!: NgForm;

  usuario: string = '';
  password: string = '';
  error: string = ''; 
  
  isDbReady: boolean = false;

  constructor(
    private router: Router, 
    private dbtaskService: DbtaskService
  ) {}

  ngOnInit() {
    this.dbtaskService.dbState().subscribe((res) => {
      if(res){
        this.isDbReady = true;
      }
    });
  }

  // SE EJECUTA AL ENTRAR (O AL VOLVER DE UN LOGOUT)
  ionViewWillEnter() {
    // 4. Reseteamos todo
    this.resetearFormulario();
  }

  resetearFormulario() {
    // Limpia los mensajes de error generales
    this.error = '';
    
    // Limpia los valores de las variables
    this.usuario = '';
    this.password = '';

    // ¡EL TRUCO! Elimina el rastro de "campo tocado" o "error rojo"
    if (this.loginForm) {
      this.loginForm.resetForm();
    }
  }

  async login() {
    this.error = ''; 

    if (!this.isDbReady) {
      this.error = 'Cargando base de datos... intenta de nuevo.';
      return;
    }

    if (!this.usuario || !this.password) {
      this.error = 'Por favor ingresa tus credenciales.';
      return;
    }

    try {
      const res = await this.dbtaskService.validarUsuario(this.usuario, this.password);
      
      if (res.rows.length > 0) {
        await this.dbtaskService.actualizarSesion(this.usuario, 1);
        
        // NOTA: Ya no borramos aquí, se borra solo al volver gracias a ionViewWillEnter
        this.router.navigate(['/home']);
      } else {
        this.error = 'Usuario o contraseña incorrectos.';
      }
    } catch (error) {
      console.error(error);
      this.error = 'Error técnico al iniciar sesión.';
    }
  }
}