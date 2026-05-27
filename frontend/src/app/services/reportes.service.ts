import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  resumen(): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumen`, { headers: this.authService.headers() });
  }

  membresiasVencidas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/membresias-vencidas`, { headers: this.authService.headers() });
  }
}
