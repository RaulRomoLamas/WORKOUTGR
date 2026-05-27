import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Navbar } from './components/navbar/navbar';
import { Sidebar } from './components/sidebar/sidebar';
import { CardResumen } from './components/card-resumen/card-resumen';
import { Login } from './pages/login/login';
import { Inicio } from './pages/inicio/inicio';
import { Dashboard } from './pages/dashboard/dashboard';
import { Usuarios } from './pages/usuarios/usuarios';
import { Membresias } from './pages/membresias/membresias';
import { Rutinas } from './pages/rutinas/rutinas';
import { RutinaDetalle } from './pages/rutina-detalle/rutina-detalle';
import { Progreso } from './pages/progreso/progreso';
import { Reportes } from './pages/reportes/reportes';
import { Contacto } from './pages/contacto/contacto';
import { AuthErrorInterceptor } from './interceptors/auth-error.interceptor';

@NgModule({
  declarations: [
    App,
    Navbar,
    Sidebar,
    CardResumen,
    Login,
    Inicio,
    Dashboard,
    Usuarios,
    Membresias,
    Rutinas,
    RutinaDetalle,
    Progreso,
    Reportes,
    Contacto,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthErrorInterceptor, multi: true }
  ],
  bootstrap: [App],
})
export class AppModule {}
