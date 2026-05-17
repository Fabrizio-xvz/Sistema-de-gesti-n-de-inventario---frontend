import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected correo = '';
  protected contrasena = '';
  protected recordar = true;

  protected cargando = signal(false);
  protected error = signal<string | null>(null);
  protected mostrarContrasena = signal(false);

  protected onInputChange(): void {
    if (this.error()) {
      this.error.set(null);
    }
  }

  protected ingresar(): void {
    if (!this.correo || !this.contrasena) {
      this.error.set('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    this.authService.login(this.correo, this.contrasena, this.recordar).subscribe({
      next: () => {
        this.cargando.set(false);
        void this.router.navigateByUrl('/dashboard');
      },
      error: (err: any) => {
        this.cargando.set(false);
        
        
        if (err instanceof Error && err.message && !err.message.includes('Http failure response')) {
          this.error.set(err.message);
          return;
        }

        if (err.status === 400 || err.status === 401) {
          const detail = err.error?.detail;
          this.error.set(detail || 'Correo o contraseña incorrectos.');
        } else {
          this.error.set('Error al conectar con el servidor. Inténtalo de nuevo.');
        }
        console.error('Error de login:', err);
      },
    });
  }
}
