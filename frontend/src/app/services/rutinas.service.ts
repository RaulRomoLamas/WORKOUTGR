import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RutinasService {
  apiUrl = `${environment.apiUrl}/rutinas`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.authService.headers() });
  }

  obtener(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.authService.headers() });
  }

  misRutinas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis-rutinas`, { headers: this.authService.headers() });
  }

  porCliente(clienteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cliente/${clienteId}`, { headers: this.authService.headers() });
  }

  crear(rutina: any): Observable<any> {
    return this.http.post(this.apiUrl, rutina, { headers: this.authService.headers() });
  }

  actualizar(id: number, rutina: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, rutina, { headers: this.authService.headers() });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.authService.headers() });
  }
}
