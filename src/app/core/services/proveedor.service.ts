import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Proveedor, ProveedorPayload, InactivarPayload } from '../models/proveedor.model';

interface ApiResponse<T> {
  ok: boolean;
  mensaje: string;
  datos: T;
}

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/proveedores`;

  private cache$: Observable<Proveedor[]> | null = null;

  getAll(): Observable<Proveedor[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<ApiResponse<Proveedor[]>>(this.apiUrl).pipe(
        map(res => res.datos),
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  clearCache(): void {
    this.cache$ = null;
  }

  getById(id: number): Observable<Proveedor> {
    return this.http.get<ApiResponse<Proveedor>>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.datos)
    );
  }

  create(data: ProveedorPayload): Observable<Proveedor> {
    return this.http.post<ApiResponse<Proveedor>>(this.apiUrl, data).pipe(
      map(res => res.datos),
      tap(() => this.clearCache())
    );
  }

  update(id: number, data: ProveedorPayload): Observable<Proveedor> {
    return this.http.put<ApiResponse<Proveedor>>(`${this.apiUrl}/${id}`, data).pipe(
      map(res => res.datos),
      tap(() => this.clearCache())
    );
  }

  inactivate(id: number, motivo: string): Observable<Proveedor> {
    const payload: InactivarPayload = { motivo };
    return this.http.patch<ApiResponse<Proveedor>>(`${this.apiUrl}/${id}/inactivar`, payload).pipe(
      map(res => res.datos),
      tap(() => this.clearCache())
    );
  }
}
