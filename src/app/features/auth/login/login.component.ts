import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  protected correo = '';
  protected contrasena = '';
  protected recordar = true;

  constructor(private readonly router: Router) {}

  protected ingresar(): void {
    void this.router.navigateByUrl('/dashboard');
  }
}
