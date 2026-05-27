import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsuarioSesion {
  id: number;
  nombre: string;
  correo: string;
  rol: 'administrador' | 'entrenador' | 'cliente';
  telefono?: string;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(credenciales: { correo: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales);
  }

  register(usuario: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, usuario);
  }

  guardarSesion(respuesta: any): void {
    localStorage.setItem('token', respuesta.token);
    localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
    localStorage.setItem('rol', respuesta.rol);
  }

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  getUsuario(): UsuarioSesion | null {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) as UsuarioSesion : null;
  }

  getRol(): string {
    return localStorage.getItem('rol') || '';
  }

  estaAutenticado(): boolean {
    return Boolean(this.getToken());
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
  }

  headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` });
  }
}
