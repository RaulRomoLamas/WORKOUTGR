import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ContactoService {
  private apiUrl = `${environment.apiUrl}/mensajes`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  listar(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.authService.headers() });
  }

  enviar(mensaje: any): Observable<any> {
    return this.http.post(this.apiUrl, mensaje);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.authService.headers() });
  }
}
