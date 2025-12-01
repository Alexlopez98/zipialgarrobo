import { Component, OnInit, ViewChild } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms'; 
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

  ionViewWillEnter() {
    this.resetearFormulario();
  }

  resetearFormulario() {
    this.error = '';
    
    this.usuario = '';
    this.password = '';

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