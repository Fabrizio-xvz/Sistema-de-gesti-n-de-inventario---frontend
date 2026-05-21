import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  ok: boolean;
  mensaje: string;
  datos: T;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reportes`;

  getValorizacion(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/valorizacion`).pipe(
      map(res => res.datos)
    );
  }

  getRotacion(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/rotacion`).pipe(
      map(res => res.datos)
    );
  }

  getStockCritico(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/stock-critico`).pipe(
      map(res => res.datos)
    );
  }
}
