import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, ViewWillEnter } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiConductoresService } from '../../services/api-conductores.service';
import { DbtaskService } from '../../services/dbtask';
import { addIcons } from 'ionicons';
import { carSportOutline, personOutline, idCardOutline, arrowBackOutline, star, timeOutline, checkmarkCircle } from 'ionicons/icons';
import { Chart, registerables } from 'chart.js';

// Registramos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-registro-conductor',
  templateUrl: './registro-conductor.page.html',
  styleUrls: ['./registro-conductor.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegistroConductorPage implements ViewWillEnter {

  @ViewChild('barCanvas') private barCanvas: ElementRef | undefined;
  barChart: any;

  esConductor: boolean = false; // Controla qué pantalla se ve
  cargando: boolean = true;
  
  // Datos del conductor existente
  miPerfil: any = null;

  // Datos para el formulario (si no es conductor)
  conductor = {
    nombre: '',
    vehiculo: '',
    patente: '',
    estado: 'Disponible',
    calificacion: 5.0,
    propietario: ''
  };

  constructor(
    private apiService: ApiConductoresService,
    private dbtaskService: DbtaskService,
    private toastController: ToastController,
    private router: Router
  ) {
    addIcons({ carSportOutline, personOutline, idCardOutline, arrowBackOutline, star, timeOutline, checkmarkCircle });
  }

  async ionViewWillEnter() {
    this.cargando = true;
    this.esConductor = false;
    this.miPerfil = null;

    try {
      const usuario = await this.dbtaskService.obtenerUsuarioActivo();
      if (usuario) {
        this.verificarSiEsConductor(usuario);
      }
    } catch (e) {
      this.cargando = false;
    }
  }

  verificarSiEsConductor(usuario: string) {
    this.apiService.getConductorPorUsuario(usuario).subscribe({
      next: (data) => {
        // ¡SÍ ES CONDUCTOR! Mostramos el Dashboard
        this.esConductor = true;
        this.miPerfil = data;
        this.cargando = false;
        
        // Esperamos un poco a que el HTML renderice el Canvas para dibujar el gráfico
        setTimeout(() => this.crearGrafico(), 100);
      },
      error: () => {
        // NO ES CONDUCTOR (404) -> Mostramos formulario
        this.esConductor = false;
        this.cargando = false;
        this.conductor.propietario = usuario; // Preparamos el usuario para registrar
      }
    });
  }

  crearGrafico() {
    if (this.barChart) {
      this.barChart.destroy(); // Limpiamos si ya existía
    }

    if(this.barCanvas) {
      this.barChart = new Chart(this.barCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Viajes Totales', 'Calificación'],
          datasets: [{
            label: 'Mis Estadísticas',
            data: [this.miPerfil.cantidad_votos, this.miPerfil.calificacion],
            backgroundColor: [
              'rgba(54, 162, 235, 0.6)', // Azul
              'rgba(255, 206, 86, 0.6)'  // Amarillo
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  registrar() {
    // ... (Tu misma lógica de registro anterior) ...
    this.cargando = true;
    this.apiService.agregarConductor(this.conductor).subscribe({
      next: async (res) => {
        const toast = await this.toastController.create({
          message: '¡Bienvenido al equipo! Ahora eres conductor.',
          duration: 2000, color: 'success'
        });
        await toast.present();
        // Recargamos la vista para que ahora salga el perfil
        this.ionViewWillEnter(); 
      },
      error: async (err) => {
        // ... manejo de error ...
        this.cargando = false;
      }
    });
  }
}