import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  error = '';
  cargando = false;

  loginForm = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  ingresar(): void {
    if (this.loginForm.invalid) {
      this.error = 'Completa correo y password.';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (respuesta) => {
        this.authService.guardarSesion(respuesta);
        const destino = respuesta.rol === 'cliente' ? '/inicio' : '/dashboard';
        this.router.navigate([destino]);
      },
      error: (error) => {
        this.error = error.error?.mensaje || 'No fue posible iniciar sesion.';
        this.cargando = false;
      }
    });
  }
}
