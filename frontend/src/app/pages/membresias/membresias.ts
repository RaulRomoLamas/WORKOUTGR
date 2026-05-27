import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MembresiasService } from '../../services/membresias.service';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-membresias',
  standalone: false,
  templateUrl: './membresias.html',
  styleUrl: './membresias.css',
})
export class Membresias implements OnInit {
  private fb = inject(FormBuilder);
  private membresiasService = inject(MembresiasService);
  private usuariosService = inject(UsuariosService);
  private changeDetector = inject(ChangeDetectorRef);

  membresias: any[] = [];
  clientes: any[] = [];
  mensaje = '';
  error = '';
  editando = false;
  busquedaCliente = '';
  busquedaTabla = '';
  planes = [
    { meses: 1, nombre: '1 mes', precio: 550 },
    { meses: 3, nombre: '3 meses', precio: 1400 },
    { meses: 12, nombre: 'Anual', precio: 4500 }
  ];

  membresiaForm = this.fb.nonNullable.group({
    id: [0],
    usuario_id: [0, Validators.required],
    plan_meses: [1, Validators.required],
    tipo: ['mensual'],
    fecha_inicio: ['', Validators.required],
    fecha_fin: ['', Validators.required],
    estado: ['activa', Validators.required],
    monto: [0, Validators.required]
  });

  ngOnInit(): void {
    this.cargar();
    this.cargarClientes();
    this.limpiar();
    this.membresiaForm.controls.plan_meses.valueChanges.subscribe(() => this.actualizarResumenPlan());
    this.membresiaForm.controls.fecha_inicio.valueChanges.subscribe(() => this.actualizarResumenPlan());
  }

  cargar(): void {
    this.membresiasService.listar().subscribe({
      next: (data) => {
        this.membresias = data;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar las membresias.';
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
    this.actualizarResumenPlan();

    if (this.membresiaForm.invalid || this.membresiaForm.controls.usuario_id.value === 0) {
      this.error = 'Selecciona cliente, plan e inicio.';
      return;
    }

    const membresia = this.prepararMembresia();
    if (membresia.fecha_fin < membresia.fecha_inicio) {
      this.error = 'La fecha de fin no puede ser anterior al inicio.';
      return;
    }

    const peticion = this.editando
      ? this.membresiasService.actualizar(membresia.id, membresia)
      : this.membresiasService.crear(membresia);

    peticion.subscribe({
      next: (respuesta: any) => {
        this.mensaje = respuesta?.mensaje
          ? `${respuesta.mensaje}.`
          : this.editando ? 'Membresia actualizada.' : 'Membresia creada.';
        this.error = '';
        this.limpiar();
        this.cargar();
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'No se pudo guardar la membresia.';
        this.changeDetector.detectChanges();
      }
    });
  }

  editar(membresia: any): void {
    this.editando = true;
    const plan = this.planDesdeMembresia(membresia);
    this.busquedaCliente = membresia.cliente || '';
    this.membresiaForm.patchValue({
      ...membresia,
      plan_meses: plan.meses,
      monto: plan.precio,
      estado: membresia.estado === 'cancelada' ? 'cancelada' : 'activa',
      fecha_inicio: this.formatearFecha(membresia.fecha_inicio),
      fecha_fin: this.formatearFecha(membresia.fecha_fin)
    }, { emitEvent: false });
    this.actualizarResumenPlan();
  }

  eliminar(id: number): void {
    const membresia = this.membresias.find(item => item.id === id);
    const cliente = membresia?.cliente || 'este cliente';
    if (!window.confirm(`¿Cancelar la membresía de ${cliente}? Se conservará el historial de pagos.`)) {
      return;
    }

    this.membresiasService.eliminar(id).subscribe({
      next: () => {
        this.mensaje = 'Membresía cancelada.';
        this.cargar();
      },
      error: () => {
        this.error = 'No se pudo eliminar la membresia.';
        this.changeDetector.detectChanges();
      }
    });
  }

  limpiar(): void {
    this.editando = false;
    this.busquedaCliente = '';
    this.membresiaForm.reset({
      id: 0,
      usuario_id: 0,
      plan_meses: 1,
      tipo: 'mensual',
      fecha_inicio: this.fechaHoy(),
      fecha_fin: '',
      estado: 'activa',
      monto: 550
    });
    this.actualizarResumenPlan();
  }

  clientesFiltrados(): any[] {
    const busqueda = this.busquedaCliente.trim().toLowerCase();
    if (!busqueda) return this.clientes.slice(0, 8);

    return this.clientes
      .filter(cliente => cliente.nombre.toLowerCase().includes(busqueda))
      .slice(0, 8);
  }

  membresiasFiltradas(): any[] {
    const busqueda = this.busquedaTabla.trim().toLowerCase();
    if (!busqueda) return this.membresias;

    return this.membresias.filter(membresia =>
      `${membresia.cliente || ''} ${membresia.correo || ''}`.toLowerCase().includes(busqueda)
    );
  }

  resumenRecepcion(): { activas: number; vencenPronto: number; vencidas: number; pagosHoy: number; ingresosHoy: number } {
    const hoy = this.fechaHoy();

    return this.membresias.reduce((resumen, membresia) => {
      const estado = this.estadoEfectivo(membresia);
      const fechaPago = this.formatearFecha(membresia.ultimo_pago_fecha || '');

      if (estado === 'activa') resumen.activas += 1;
      if (estado === 'vence_pronto') resumen.vencenPronto += 1;
      if (estado === 'vencida') resumen.vencidas += 1;
      if (fechaPago === hoy) {
        resumen.pagosHoy += 1;
        resumen.ingresosHoy += Number(membresia.ultimo_pago_monto || 0);
      }

      return resumen;
    }, { activas: 0, vencenPronto: 0, vencidas: 0, pagosHoy: 0, ingresosHoy: 0 });
  }

  seleccionarCliente(cliente: any): void {
    this.busquedaCliente = cliente.nombre;
    this.membresiaForm.controls.usuario_id.setValue(cliente.id);
    this.error = '';
  }

  limpiarCliente(): void {
    this.busquedaCliente = '';
    this.membresiaForm.controls.usuario_id.setValue(0);
  }

  clienteSeleccionado(): string {
    const cliente = this.clientes.find(item => item.id === this.membresiaForm.controls.usuario_id.value);
    return cliente?.nombre || '';
  }

  seleccionarPlan(meses: number): void {
    this.membresiaForm.controls.plan_meses.setValue(meses);
  }

  planSeleccionado(): { meses: number; nombre: string; precio: number } {
    return this.planPorMeses(this.membresiaForm.controls.plan_meses.value);
  }

  planVisible(membresia: any): string {
    const meses = this.mesesEntreFechas(membresia.fecha_inicio, membresia.fecha_fin);
    return meses === 1 ? '1 mes' : `${meses} meses`;
  }

  estadoVisible(membresia: any): string {
    const estado = this.estadoEfectivo(membresia);
    if (estado === 'cancelada') return 'Cancelada';
    if (estado === 'vencida') return 'Vencida';
    if (estado === 'vence_pronto') return 'Vence pronto';
    return 'Activa';
  }

  estadoEfectivo(membresia: any): string {
    if (membresia.estado === 'cancelada') return 'cancelada';
    if (membresia.estado === 'vence_pronto') return 'vence_pronto';
    if (!membresia.fecha_fin) return membresia.estado || 'activa';

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaFin = new Date(`${this.formatearFecha(membresia.fecha_fin)}T00:00:00`);
    const limitePronto = new Date(hoy);
    limitePronto.setDate(limitePronto.getDate() + 7);

    if (fechaFin >= hoy && fechaFin <= limitePronto) return 'vence_pronto';
    return fechaFin < hoy ? 'vencida' : 'activa';
  }

  montoTotal(membresia: any): number {
    return Number(membresia.total_pagado ?? membresia.monto ?? 0);
  }

  ultimoPago(membresia: any): number {
    return Number(membresia.ultimo_pago_monto ?? membresia.monto ?? 0);
  }

  private actualizarResumenPlan(): void {
    const inicio = this.membresiaForm.controls.fecha_inicio.value;
    const plan = this.planSeleccionado();
    if (!inicio) return;

    const fechaFin = this.sumarMeses(inicio, plan.meses);
    fechaFin.setDate(fechaFin.getDate() - 1);
    this.membresiaForm.controls.fecha_fin.setValue(this.fechaParaInput(fechaFin), { emitEvent: false });
    this.membresiaForm.controls.monto.setValue(plan.precio, { emitEvent: false });
    this.membresiaForm.controls.tipo.setValue(this.tipoParaMeses(plan.meses), { emitEvent: false });
  }

  private formatearFecha(fecha: string): string {
    return fecha ? fecha.substring(0, 10) : '';
  }

  private prepararMembresia(): any {
    const membresia = this.membresiaForm.getRawValue();
    const plan = this.planPorMeses(membresia.plan_meses);

    return {
      id: membresia.id,
      usuario_id: membresia.usuario_id,
      tipo: this.tipoParaMeses(plan.meses),
      fecha_inicio: membresia.fecha_inicio,
      fecha_fin: membresia.fecha_fin,
      estado: membresia.estado,
      monto: plan.precio
    };
  }

  private planDesdeMembresia(membresia: any): { meses: number; nombre: string; precio: number } {
    const monto = Number(membresia.monto);
    const porPrecio = this.planes.find(plan => plan.precio === monto);
    if (porPrecio) return porPrecio;

    const meses = this.mesesEntreFechas(membresia.fecha_inicio, membresia.fecha_fin);
    return this.planPorMeses(meses);
  }

  private planPorMeses(meses: number): { meses: number; nombre: string; precio: number } {
    return this.planes.find(plan => plan.meses === Number(meses)) || this.planes[0];
  }

  private tipoParaMeses(meses: number): string {
    if (meses >= 12) return 'anual';
    if (meses >= 3) return 'trimestral';
    return 'mensual';
  }

  private mesesEntreFechas(inicio: string, fin: string): number {
    if (!inicio || !fin) return 1;

    const fechaInicio = new Date(`${this.formatearFecha(inicio)}T00:00:00`);
    const fechaFin = new Date(`${this.formatearFecha(fin)}T00:00:00`);
    fechaFin.setDate(fechaFin.getDate() + 1);

    const meses = (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12
      + fechaFin.getMonth()
      - fechaInicio.getMonth();

    return Math.max(1, meses || 1);
  }

  private sumarMeses(fecha: string, meses: number): Date {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const ultimoDiaDestino = new Date(anio, mes + meses, 0).getDate();
    return new Date(anio, mes - 1 + meses, Math.min(dia, ultimoDiaDestino));
  }

  private fechaHoy(): string {
    return this.fechaParaInput(new Date());
  }

  private fechaParaInput(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }
}
