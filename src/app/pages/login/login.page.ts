import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  usuario: string = '';
  password: string = '';
  error: string = '';

  constructor(private router: Router) {}

  login() {
    // Validaciones adicionales de seguridad
    const usuarioValido = /^[a-zA-Z]+$/.test(this.usuario);
    const passwordValido = /^[0-9]{4}$/.test(this.password);

    if (!usuarioValido) {
      this.error = 'El usuario debe contener solo letras.';
      return;
    }

    if (!passwordValido) {
      this.error = 'La contraseña debe tener exactamente 4 números.';
      return;
    }

    // Login válido
    this.error = '';
    this.router.navigate(['/home'], {
      state: { usuario: this.usuario, password: this.password }
    });
  }
}
