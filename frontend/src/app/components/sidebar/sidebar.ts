import { Component, EventEmitter, Input, Output } from '@angular/core';

interface MenuItem {
  ruta: string;
  texto: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() rol = '';
  @Output() cerrarSesion = new EventEmitter<void>();

  menu: MenuItem[] = [
    { ruta: '/inicio', texto: 'Inicio', roles: ['administrador', 'entrenador', 'cliente'] },
    { ruta: '/dashboard', texto: 'Dashboard', roles: ['administrador', 'entrenador'] },
    { ruta: '/usuarios', texto: 'Usuarios', roles: ['administrador'] },
    { ruta: '/membresias', texto: 'Membresias', roles: ['administrador'] },
    { ruta: '/rutinas', texto: 'Rutinas', roles: ['administrador', 'entrenador', 'cliente'] },
    { ruta: '/progreso', texto: 'Progreso', roles: ['administrador', 'entrenador', 'cliente'] },
    { ruta: '/reportes', texto: 'Reportes', roles: ['administrador'] },
    { ruta: '/contacto', texto: 'Contacto', roles: ['administrador', 'entrenador', 'cliente'] }
  ];

  menuVisible(): MenuItem[] {
    return this.menu.filter(item => item.roles.includes(this.rol));
  }

  salir(): void {
    this.cerrarSesion.emit();
  }
}
