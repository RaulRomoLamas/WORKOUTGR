import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.authService.headers() });
  }

  obtener(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.authService.headers() });
  }

  crear(usuario: any): Observable<any> {
    return this.http.post(this.apiUrl, usuario, { headers: this.authService.headers() });
  }

  actualizar(id: number, usuario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, usuario, { headers: this.authService.headers() });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.authService.headers() });
  }
}
