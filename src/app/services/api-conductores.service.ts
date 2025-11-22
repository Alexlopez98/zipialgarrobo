import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiConductoresService {
  // IMPORTANTE:
  // Si pruebas en el navegador web: usa 'http://127.0.0.1:8000'
  // Si pruebas en celular/emulador Android: usa tu IP local 'http://192.168.X.X:8000'
  // Ejecuta tu backend con: uvicorn main:app --host 0.0.0.0 --port 8000
  private apiUrl = 'http://192.168.1.15:8000/conductores'; 

  constructor(private http: HttpClient) { }

  getConductores(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '/');
  }
}