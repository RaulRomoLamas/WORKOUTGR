import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-card-resumen',
  standalone: false,
  templateUrl: './card-resumen.html',
  styleUrl: './card-resumen.css',
})
export class CardResumen {
  @Input() titulo = '';
  @Input() valor: string | number = 0;
  @Input() detalle = '';
  @Input() tono = 'rojo';
  @Output() seleccionado = new EventEmitter<string>();
}
