import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Producto, ProductoPayload } from '../models/producto.model';

interface ApiResponse<T> {
  ok: boolean;
  mensaje: string;
  datos: T;
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  getAll(): Observable<Producto[]> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl).pipe(
      map(res => res.datos.map(p => this.mapBackendToFrontend(p)))
    );
  }

  getById(id: number): Observable<Producto> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      map(res => this.mapBackendToFrontend(res.datos))
    );
  }

  create(data: ProductoPayload): Observable<Producto> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, data).pipe(
      map(res => this.mapBackendToFrontend(res.datos))
    );
  }

  update(id: number, data: ProductoPayload): Observable<Producto> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, data).pipe(
      map(res => this.mapBackendToFrontend(res.datos))
    );
  }

  /** Maps backend product format to the frontend Producto interface */
  private mapBackendToFrontend(p: any): Producto {
    return {
      id_producto: p.id_producto,
      codigo_producto: p.codigo_producto,
      nombre_producto: p.nombre_producto,
      descripcion: p.descripcion,
      id_categoria: p.id_categoria,
      unidad_medida: p.unidad_medida,
      presentacion: p.unidad_medida ?? '',
      precio_venta: p.costo_unitario_actual ?? 0,
      costo_unitario_actual: p.costo_unitario_actual,
      notas: p.descripcion,
      activo: p.estado === 'ACTIVO',
      estado: p.estado
    };
  }
}
