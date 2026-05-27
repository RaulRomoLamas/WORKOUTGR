import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProgresoService {
  private apiUrl = `${environment.apiUrl}/progreso`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.authService.headers() });
  }

  porCliente(clienteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cliente/${clienteId}`, { headers: this.authService.headers() });
  }

  crear(progreso: any): Observable<any> {
    return this.http.post(this.apiUrl, progreso, { headers: this.authService.headers() });
  }

  actualizar(id: number, progreso: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, progreso, { headers: this.authService.headers() });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.authService.headers() });
  }
}
