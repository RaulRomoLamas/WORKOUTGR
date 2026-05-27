import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MembresiasService {
  private apiUrl = `${environment.apiUrl}/membresias`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.authService.headers() });
  }

  obtener(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.authService.headers() });
  }

  porCliente(clienteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cliente/${clienteId}`, { headers: this.authService.headers() });
  }

  vencidas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/vencidas/lista`, { headers: this.authService.headers() });
  }

  crear(membresia: any): Observable<any> {
    return this.http.post(this.apiUrl, membresia, { headers: this.authService.headers() });
  }

  actualizar(id: number, membresia: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, membresia, { headers: this.authService.headers() });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.authService.headers() });
  }
}
