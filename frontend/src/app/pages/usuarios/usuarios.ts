import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: false,
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  private fb = inject(FormBuilder);
  private usuariosService = inject(UsuariosService);
  private changeDetector = inject(ChangeDetectorRef);

  usuarios: any[] = [];
  mensaje = '';
  error = '';
  editando = false;

  usuarioForm = this.fb.nonNullable.group({
    id: [0],
    nombre: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    password: [''],
    rol: ['cliente', Validators.required],
    telefono: [''],
    activo: [true]
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.usuariosService.listar().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.changeDetector.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar los usuarios.';
        this.changeDetector.detectChanges();
      }
    });
  }

  guardar(): void {
    if (this.usuarioForm.invalid || (!this.editando && !this.usuarioForm.controls.password.value)) {
      this.error = 'Completa nombre, correo, password y rol.';
      return;
    }

    const usuario = this.usuarioForm.getRawValue();
    const peticion = this.editando
      ? this.usuariosService.actualizar(usuario.id, usuario)
      : this.usuariosService.crear(usuario);

    peticion.subscribe({
      next: () => {
        this.mensaje = this.editando ? 'Usuario actualizado.' : 'Usuario creado.';
        this.error = '';
        this.limpiar();
        this.cargar();
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'No se pudo guardar el usuario.';
        this.changeDetector.detectChanges();
      }
    });
  }

  editar(usuario: any): void {
    this.editando = true;
    this.usuarioForm.patchValue({ ...usuario, password: '', activo: Boolean(usuario.activo) });
  }

  eliminar(id: number): void {
    this.usuariosService.eliminar(id).subscribe({
      next: () => {
        this.mensaje = 'Usuario desactivado.';
        this.cargar();
      },
      error: () => {
        this.error = 'No se pudo desactivar el usuario.';
        this.changeDetector.detectChanges();
      }
    });
  }

  limpiar(): void {
    this.editando = false;
    this.usuarioForm.reset({ id: 0, nombre: '', correo: '', password: '', rol: 'cliente', telefono: '', activo: true });
  }
}
