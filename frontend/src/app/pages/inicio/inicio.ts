import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: false,
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {
  constructor(private authService: AuthService) {}

  puedeVerDashboard(): boolean {
    return ['administrador', 'entrenador'].includes(this.authService.getRol());
  }
}
