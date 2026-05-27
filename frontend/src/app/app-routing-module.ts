import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
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

const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'inicio', component: Inicio, canActivate: [authGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard], data: { roles: ['administrador', 'entrenador'] } },
  { path: 'usuarios', component: Usuarios, canActivate: [authGuard], data: { roles: ['administrador'] } },
  { path: 'membresias', component: Membresias, canActivate: [authGuard], data: { roles: ['administrador'] } },
  { path: 'rutinas', component: Rutinas, canActivate: [authGuard] },
  { path: 'rutinas/:id', component: RutinaDetalle, canActivate: [authGuard] },
  { path: 'progreso', component: Progreso, canActivate: [authGuard] },
  { path: 'reportes', component: Reportes, canActivate: [authGuard], data: { roles: ['administrador'] } },
  { path: 'contacto', component: Contacto, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
