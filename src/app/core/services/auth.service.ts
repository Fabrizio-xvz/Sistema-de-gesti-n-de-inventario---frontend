import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = `${environment.apiUrl}/autenticacion`;

  
  private readonly currentUserSignal = signal<any | null>(null);
  public readonly currentUser = this.currentUserSignal.asReadonly();

  public readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  constructor() {
    this.cargarSesionExistente();
  }

  /**
    un bypass de desarrollo local (julia@judo.pe / 123456).
   */
  public login(correo: string, contrasena: string, recordar: boolean): Observable<LoginResponse> {
    const body = new HttpParams()
      .set('username', correo)
      .set('password', contrasena);

    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, body.toString(), { headers }).pipe(
      tap((res) => {
        this.guardarToken(res.access_token, recordar);
        const decoded = this.decodeToken(res.access_token);
        this.currentUserSignal.set(decoded);
      }),
      catchError((err) => {
        const validEmail = 'julia@judo.pe';
        const validPassword = '123456';

        if (correo === validEmail && contrasena === validPassword) {
          const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqdWxpYUBqdWRvLnBlIiwibmFtZSI6IkRvw7FhIEp1bGlhIiwicm9sZSI6ImFkbWluIiwiZXhwIjoyNTI0NjA4MDAwfQ.fake_signature';
          this.guardarToken(fakeToken, recordar);
          const decoded = this.decodeToken(fakeToken);
          this.currentUserSignal.set(decoded);
          return of({ access_token: fakeToken, token_type: 'bearer' });
        }


        if (err.status === 0 || err.status === 404) {
          let customMessage = 'Correo o contraseña incorrectos.';

          if (correo !== validEmail && contrasena === validPassword) {
            customMessage = 'El correo ingresado es incorrecto.';
          } else if (correo === validEmail && contrasena !== validPassword) {
            customMessage = 'La contraseña ingresada es incorrecta.';
          } else if (correo !== validEmail && contrasena !== validPassword) {
            customMessage = 'El correo y la contraseña ingresados son incorrectos.';
          }

          return throwError(() => new Error(customMessage));
        }

       
        return throwError(() => err);
      })
    );
  }

  
  public logout(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.currentUserSignal.set(null);
    void this.router.navigateByUrl('/login');
  }


  public obtenerToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  
  private guardarToken(token: string, recordar: boolean): void {
    if (recordar) {
      localStorage.setItem('token', token);
      sessionStorage.removeItem('token'); 
    } else {
      sessionStorage.setItem('token', token);
      localStorage.removeItem('token'); 
    }
  }


  private cargarSesionExistente(): void {
    const token = this.obtenerToken();
    if (token) {
      const decoded = this.decodeToken(token);
      if (decoded && !this.isTokenExpired(decoded)) {
        this.currentUserSignal.set(decoded);
      } else {
        
        this.logout();
      }
    }
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  
  private isTokenExpired(decodedToken: any): boolean {
    if (!decodedToken.exp) {
      return false;
    }
    const date = new Date(0);
    date.setUTCSeconds(decodedToken.exp);
    return date.valueOf() < new Date().valueOf();
  }
}
