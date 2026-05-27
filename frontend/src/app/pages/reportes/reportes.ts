import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ReportesService } from '../../services/reportes.service';

@Component({
  selector: 'app-reportes',
  standalone: false,
  templateUrl: './reportes.html',
  styleUrl: './reportes.css',
})
export class Reportes implements OnInit {
  resumen: any = {};
  vencidas: any[] = [];
  error = '';

  constructor(
    private reportesService: ReportesService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.reportesService.resumen().subscribe({
      next: (data) => {
        this.resumen = data;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar el resumen.';
        this.changeDetector.detectChanges();
      }
    });

    this.reportesService.membresiasVencidas().subscribe({
      next: (data) => {
        this.vencidas = data;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar membresias vencidas.';
        this.changeDetector.detectChanges();
      }
    });
  }
}
