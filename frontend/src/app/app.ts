import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('CARBONO POWERLAB');

  constructor(private router: Router, private authService: AuthService) {}

  esLogin(): boolean {
    return this.router.url === '/login' || this.router.url === '/';
  }

  rolActual(): string {
    return this.authService.getRol();
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
