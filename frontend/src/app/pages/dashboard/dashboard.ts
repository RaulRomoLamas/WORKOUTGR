import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { ReportesService } from '../../services/reportes.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  resumen = signal<any>({
    totalUsuarios: 0,
    totalClientes: 0,
    totalEntrenadores: 0,
    membresiasActivas: 0,
    membresiasVencidas: 0,
    membresiasVencenPronto: 0,
    pagosHoy: 0,
    ingresosHoy: 0,
    totalRutinas: 0,
    totalRegistrosProgreso: 0
  });
  seleccionado = '';

  constructor(
    private reportesService: ReportesService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.reportesService.resumen().subscribe({
      next: (data) => {
        this.resumen.set(data);
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.seleccionado = 'No se pudo cargar el resumen';
        this.changeDetector.detectChanges();
      }
    });
  }

  marcar(titulo: string): void {
    this.seleccionado = `Indicador seleccionado: ${titulo}`;
  }
}
