import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RutinasService } from '../../services/rutinas.service';
import { UsuariosService } from '../../services/usuarios.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-rutinas',
  standalone: false,
  templateUrl: './rutinas.html',
  styleUrl: './rutinas.css',
})
export class Rutinas implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private rutinasService = inject(RutinasService);
  private usuariosService = inject(UsuariosService);
  private changeDetector = inject(ChangeDetectorRef);

  rutinas: any[] = [];
  clientes: any[] = [];
  entrenadores: any[] = [];
  mensaje = '';
  error = '';
  cargando = false;
  editando = false;
  rol = '';
  busquedaCliente = '';
  busquedaTabla = '';

  rutinaForm = this.fb.group({
    id: [0],
    cliente_id: [0, Validators.required],
    entrenador_id: [0, Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
    objetivo: [''],
    nivel: ['principiante'],
    fecha_asignacion: ['', Validators.required],
    ejercicios: this.fb.array<FormGroup>([])
  });

  ngOnInit(): void {
    this.rol = this.authService.getRol();
    this.agregarEjercicio();
    this.cargar();
    if (this.puedeEditar()) {
      this.cargarUsuarios();
    }
  }

  get ejercicios(): FormArray<FormGroup> {
    return this.rutinaForm.controls.ejercicios;
  }

  puedeEditar(): boolean {
    return this.rol !== 'cliente';
  }

  crearEjercicio(): FormGroup {
    return this.fb.group({
      ejercicio: ['', Validators.required],
      series: [3],
      repeticiones: ['10'],
      descanso: ['60 seg']
    });
  }

  agregarEjercicio(): void {
    this.ejercicios.push(this.crearEjercicio());
  }

  quitarEjercicio(index: number): void {
    if (this.ejercicios.length > 1) {
      this.ejercicios.removeAt(index);
    }
  }

  cargar(): void {
    if (this.rol === 'cliente') {
      this.cargarRutinasCliente();
      return;
    }

    this.cargando = true;
    this.error = '';

    this.rutinasService.listar().subscribe({
      next: (data) => {
        this.rutinas = data;
        this.cargando = false;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar las rutinas.';
        this.cargando = false;
        this.changeDetector.detectChanges();
      }
    });
  }

  async cargarRutinasCliente(): Promise<void> {
    const usuario = this.authService.getUsuario();
    this.cargando = true;
    this.error = '';
    this.rutinas = [];
    this.changeDetector.detectChanges();

    try {
      this.rutinas = await this.consultarRutinasCliente(`${environment.apiUrl}/rutinas/mis-rutinas`);
    } catch {
      try {
        this.rutinas = usuario
          ? await this.consultarRutinasCliente(`${environment.apiUrl}/rutinas/cliente/${usuario.id}`)
          : [];
      } catch {
        this.error = 'No se pudieron cargar las rutinas.';
      }
    } finally {
      this.cargando = false;
      this.changeDetector.detectChanges();
    }
  }

  async consultarRutinasCliente(url: string): Promise<any[]> {
    const controlador = new AbortController();
    const cancelar = window.setTimeout(() => controlador.abort(), 7000);

    try {
      const respuesta = await fetch(url, {
        headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        signal: controlador.signal
      });

      if (!respuesta.ok) {
        throw new Error('No se pudieron cargar las rutinas.');
      }

      return await respuesta.json();
    } finally {
      window.clearTimeout(cancelar);
    }
  }

  cargarUsuarios(): void {
    this.usuariosService.listar().subscribe({
      next: (data) => {
        this.clientes = data.filter(usuario => usuario.rol === 'cliente' && usuario.activo);
        this.entrenadores = data.filter(usuario => usuario.rol === 'entrenador' && usuario.activo);
        const actual = this.authService.getUsuario();
        if (actual?.rol === 'entrenador' && !this.entrenadores.some(entrenador => entrenador.id === actual.id)) {
          this.entrenadores = [...this.entrenadores, actual];
        }
        this.changeDetector.detectChanges();
      },
      error: () => {
        const actual = this.authService.getUsuario();
        this.entrenadores = actual?.rol === 'entrenador' ? [actual] : [];
        this.changeDetector.detectChanges();
      }
    });
  }

  guardar(): void {
    if (this.rutinaForm.invalid || this.rutinaForm.controls.cliente_id.value === 0 || this.rutinaForm.controls.entrenador_id.value === 0) {
      this.error = 'Completa cliente, entrenador, nombre y fecha.';
      return;
    }

    const rutina = this.rutinaForm.getRawValue();
    const peticion = this.editando && rutina.id
      ? this.rutinasService.actualizar(rutina.id, rutina)
      : this.rutinasService.crear(rutina);

    peticion.subscribe({
      next: () => {
        this.mensaje = this.editando ? 'Rutina actualizada.' : 'Rutina creada.';
        this.error = '';
        this.limpiar();
        this.cargar();
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'No se pudo guardar la rutina.';
        this.changeDetector.detectChanges();
      }
    });
  }

  editar(rutina: any): void {
    this.rutinasService.obtener(rutina.id).subscribe({
      next: (detalle) => {
        this.editando = true;
        this.busquedaCliente = detalle.cliente || rutina.cliente || '';
        this.ejercicios.clear();
        const ejercicios = detalle.ejercicios?.length ? detalle.ejercicios : [{}];
        ejercicios.forEach((ejercicio: any) => this.ejercicios.push(this.fb.group({
          ejercicio: [ejercicio.ejercicio || '', Validators.required],
          series: [ejercicio.series || 3],
          repeticiones: [ejercicio.repeticiones || '10'],
          descanso: [ejercicio.descanso || '60 seg']
        })));
        this.rutinaForm.patchValue({
          ...detalle,
          fecha_asignacion: detalle.fecha_asignacion?.substring(0, 10)
        });
        this.changeDetector.detectChanges();
      }
    });
  }

  eliminar(id: number): void {
    this.rutinasService.eliminar(id).subscribe({
      next: () => {
        this.mensaje = 'Rutina eliminada.';
        this.cargar();
      },
      error: () => {
        this.error = 'No se pudo eliminar la rutina.';
        this.changeDetector.detectChanges();
      }
    });
  }

  limpiar(): void {
    this.editando = false;
    this.busquedaCliente = '';
    this.rutinaForm.reset({
      id: 0,
      cliente_id: 0,
      entrenador_id: 0,
      nombre: '',
      descripcion: '',
      objetivo: '',
      nivel: 'principiante',
      fecha_asignacion: ''
    });
    this.ejercicios.clear();
    this.agregarEjercicio();
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
    this.rutinaForm.controls.cliente_id.setValue(cliente.id);
    this.error = '';
  }

  limpiarCliente(): void {
    this.busquedaCliente = '';
    this.rutinaForm.controls.cliente_id.setValue(0);
  }

  clienteSeleccionado(): string {
    const cliente = this.clientes.find(item => item.id === this.rutinaForm.controls.cliente_id.value);
    return cliente?.nombre || '';
  }

  rutinasFiltradas(): any[] {
    const busqueda = this.busquedaTabla.trim().toLowerCase();
    if (!busqueda) return this.rutinas;

    return this.rutinas.filter(rutina =>
      `${rutina.nombre || ''} ${rutina.cliente || ''} ${rutina.entrenador || ''}`.toLowerCase().includes(busqueda)
    );
  }
}
