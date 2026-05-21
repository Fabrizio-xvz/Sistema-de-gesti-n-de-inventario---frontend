import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventarioItem, InventarioConfigPayload } from '../models/inventario.model';

interface ApiResponse<T> {
  ok: boolean;
  mensaje: string;
  datos: T;
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/inventario`;

  getAll(): Observable<InventarioItem[]> {
    return this.http.get<ApiResponse<InventarioItem[]>>(`${this.apiUrl}/stock`).pipe(
      map(res => res.datos)
    );
  }

  getStockCritico(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/stock/critico`).pipe(
      map(res => res.datos)
    );
  }

  updateConfig(productId: number, payload: InventarioConfigPayload): Observable<InventarioItem> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/parametros/${productId}`, payload).pipe(
      map(res => res.datos)
    );
  }
}
