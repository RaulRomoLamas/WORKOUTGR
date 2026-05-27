import { Component } from '@angular/core';
import { ContactoService } from '../../services/contacto.service';

@Component({
  selector: 'app-contacto',
  standalone: false,
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto {
  mensajeContacto = {
    nombre: '',
    correo: '',
    asunto: '',
    mensaje: ''
  };
  enviado = '';
  error = '';

  constructor(private contactoService: ContactoService) {}

  enviar(): void {
    this.contactoService.enviar(this.mensajeContacto).subscribe({
      next: () => {
        this.enviado = 'Mensaje enviado correctamente.';
        this.error = '';
        this.mensajeContacto = { nombre: '', correo: '', asunto: '', mensaje: '' };
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'No se pudo enviar el mensaje.';
        this.enviado = '';
      }
    });
  }
}
