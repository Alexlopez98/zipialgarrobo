import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiConductoresService {
  

  // Recuerda:
  // - Para Emulador Android: 'http://10.0.2.2:8000/conductores'
  // - Para Web (ionic serve): 'http://127.0.0.1:8000/conductores'
  // - Para Celular Físico: 'http://TU_IP_PC:8000/conductores'
  private apiUrl = 'http://10.0.2.2:8000/conductores'; 

  constructor(private http: HttpClient) { }

  getConductores(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '/');
  }

  getConductorPorUsuario(usuario: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/por-usuario/${usuario}`);
  }

  agregarConductor(conductor: any): Observable<any> {
    return this.http.post(this.apiUrl + '/', conductor);
  }

  eliminarConductor(id: number, solicitante: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}?nombre_solicitante=${solicitante}`);
  }

  calificarConductor(id: number, estrellas: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/calificar?estrellas=${estrellas}`, {});
  }
}

