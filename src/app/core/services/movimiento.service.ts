import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movimiento, MovimientoPayload } from '../models/movimiento.model';

interface ApiResponse<T> {
  ok: boolean;
  mensaje: string;
  datos: T;
}

@Injectable({
  providedIn: 'root'
})
export class MovimientoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/movimientos`;

  getAll(): Observable<Movimiento[]> {
    return this.http.get<ApiResponse<Movimiento[]>>(this.apiUrl).pipe(
      map(res => res.datos)
    );
  }

  getById(id: number): Observable<Movimiento> {
    return this.http.get<ApiResponse<Movimiento>>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.datos)
    );
  }

  create(data: MovimientoPayload): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, data).pipe(
      map(res => res.datos)
    );
  }
}
