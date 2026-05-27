import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService, UsuarioSesion } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  @Output() cerrarSesion = new EventEmitter<void>();
  usuario: UsuarioSesion | null = null;

  constructor(private authService: AuthService) {
    this.usuario = this.authService.getUsuario();
  }

  rutaInicio(): string {
    return this.usuario?.rol === 'cliente' ? '/inicio' : '/dashboard';
  }

  salir(): void {
    this.cerrarSesion.emit();
  }
}
