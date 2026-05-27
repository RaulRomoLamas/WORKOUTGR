import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProgresoService } from '../../services/progreso.service';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-progreso',
  standalone: false,
  templateUrl: './progreso.html',
  styleUrl: './progreso.css',
})
export class Progreso implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private progresoService = inject(ProgresoService);
  private usuariosService = inject(UsuariosService);
  private changeDetector = inject(ChangeDetectorRef);

  registros: any[] = [];
  clientes: any[] = [];
  mensaje = '';
  error = '';
  editando = false;
  rol = '';
  busquedaCliente = '';
  busquedaTabla = '';

  progresoForm = this.fb.nonNullable.group({
    id: [0],
    cliente_id: [0, Validators.required],
    peso: [0],
    porcentaje_grasa: [0],
    cintura: [0],
    pecho: [0],
    brazo: [0],
    pierna: [0],
    fecha_registro: ['', Validators.required],
    observaciones: ['']
  });

  ngOnInit(): void {
    this.rol = this.authService.getRol();
    this.cargar();
    this.cargarClientes();
  }

  puedeEditar(): boolean {
    return this.rol !== 'cliente';
  }

  cargar(): void {
    const usuario = this.authService.getUsuario();
    const peticion = this.rol === 'cliente' && usuario
      ? this.progresoService.porCliente(usuario.id)
      : this.progresoService.listar();

    peticion.subscribe({
      next: (data) => {
        this.registros = data;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar el historial.';
        this.changeDetector.detectChanges();
      }
    });
  }

  cargarClientes(): void {
    this.usuariosService.listar().subscribe({
      next: (data) => {
        this.clientes = data.filter(usuario => usuario.rol === 'cliente' && usuario.activo);
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.clientes = [];
        this.changeDetector.detectChanges();
      }
    });
  }

  guardar(): void {
    if (this.progresoForm.invalid || this.progresoForm.controls.cliente_id.value === 0) {
      this.error = 'Selecciona cliente y fecha.';
      return;
    }

    const progreso = this.progresoForm.getRawValue();
    const peticion = this.editando && progreso.id
      ? this.progresoService.actualizar(progreso.id, progreso)
      : this.progresoService.crear(progreso);

    peticion.subscribe({
      next: () => {
        this.mensaje = this.editando ? 'Progreso actualizado.' : 'Progreso registrado.';
        this.error = '';
        this.limpiar();
        this.cargar();
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'No se pudo guardar el progreso.';
        this.changeDetector.detectChanges();
      }
    });
  }

  editar(registro: any): void {
    this.editando = true;
    this.busquedaCliente = registro.cliente || '';
    this.progresoForm.patchValue({
      ...registro,
      fecha_registro: registro.fecha_registro?.substring(0, 10)
    });
  }

  eliminar(id: number): void {
    this.progresoService.eliminar(id).subscribe({
      next: () => {
        this.mensaje = 'Registro eliminado.';
        this.cargar();
      },
      error: () => {
        this.error = 'No se pudo eliminar el registro.';
        this.changeDetector.detectChanges();
      }
    });
  }

  limpiar(): void {
    this.editando = false;
    this.busquedaCliente = '';
    this.progresoForm.reset({
      id: 0,
      cliente_id: 0,
      peso: 0,
      porcentaje_grasa: 0,
      cintura: 0,
      pecho: 0,
      brazo: 0,
      pierna: 0,
      fecha_registro: '',
      observaciones: ''
    });
  }

  clientesFiltrados(): any[] {
    const busqueda = this.busquedaCliente.trim().toLowerCase();
    if (!busqueda) return this.clientes.slice(0, 8);

    return this.clientes
      .filter(cliente => `${cliente.nombre || ''} ${cliente.correo || ''}`.toLowerCase().includes(busqueda))
      .slice(0, 8);
  }

  seleccionarCliente(cliente: any): void {
    this.busquedaCliente = cliente.nombre;
    this.progresoForm.controls.cliente_id.setValue(cliente.id);
    this.error = '';
  }

  limpiarCliente(): void {
    this.busquedaCliente = '';
    this.progresoForm.controls.cliente_id.setValue(0);
  }

  clienteSeleccionado(): string {
    const cliente = this.clientes.find(item => item.id === this.progresoForm.controls.cliente_id.value);
    return cliente?.nombre || '';
  }

  registrosFiltrados(): any[] {
    const busqueda = this.busquedaTabla.trim().toLowerCase();
    if (!busqueda) return this.registros;

    return this.registros.filter(registro =>
      `${registro.cliente || ''}`.toLowerCase().includes(busqueda)
    );
  }
}
