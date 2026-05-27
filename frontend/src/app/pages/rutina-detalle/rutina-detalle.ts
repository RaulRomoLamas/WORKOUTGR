import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-rutina-detalle',
  standalone: false,
  templateUrl: './rutina-detalle.html',
  styleUrl: './rutina-detalle.css',
})
export class RutinaDetalle implements OnInit {
  rutina: any = null;
  error = '';
  cargando = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private changeDetector: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    await this.cargarDetalle(id);
  }

  async cargarDetalle(id: number): Promise<void> {
    this.cargando = true;
    this.error = '';
    this.rutina = null;
    this.changeDetector.detectChanges();

    const controlador = new AbortController();
    const cancelar = window.setTimeout(() => controlador.abort(), 7000);

    try {
      const respuesta = await fetch(`${environment.apiUrl}/rutinas/${id}`, {
        headers: { Authorization: `Bearer ${this.authService.getToken()}` },
        signal: controlador.signal
      });

      if (!respuesta.ok) {
        throw new Error('No se pudo cargar la rutina.');
      }

      this.rutina = await respuesta.json();
    } catch {
      this.error = 'No se pudo cargar la rutina.';
    } finally {
      window.clearTimeout(cancelar);
      this.cargando = false;
      this.changeDetector.detectChanges();
    }
  }
}
