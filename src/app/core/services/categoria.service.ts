import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, Subject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria, CategoriaPayload, InactivarPayload } from '../models/categoria.model';

interface ApiResponse<T> {
  ok: boolean;
  mensaje: string;
  datos: T;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/categorias`;

  private cache$: Observable<Categoria[]> | null = null;

  getAll(): Observable<Categoria[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<ApiResponse<any[]>>(this.apiUrl).pipe(
        map(res => res.datos.map(c => this.mapToFrontend(c))),
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  clearCache(): void {
    this.cache$ = null;
  }

  getById(id: number): Observable<Categoria> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}`).pipe(
      map(res => this.mapToFrontend(res.datos))
    );
  }

  create(data: CategoriaPayload): Observable<Categoria> {
    const payload = {
      nombre_categoria: data.nombre_categoria,
      descripcion: data.descripcion ?? null
    };
    return this.http.post<ApiResponse<any>>(this.apiUrl, payload).pipe(
      map(res => this.mapToFrontend(res.datos)),
      tap(() => this.clearCache())
    );
  }

  update(id: number, data: CategoriaPayload): Observable<Categoria> {
    const payload = {
      nombre_categoria: data.nombre_categoria,
      descripcion: data.descripcion ?? null
    };
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/${id}`, payload).pipe(
      map(res => this.mapToFrontend(res.datos)),
      tap(() => this.clearCache())
    );
  }

  inactivate(id: number, motivo: string = 'Desactivación manual'): Observable<Categoria> {
    const payload: InactivarPayload = { motivo };
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}/inactivar`, payload).pipe(
      map(res => this.mapToFrontend(res.datos)),
      tap(() => this.clearCache())
    );
  }

  private mapToFrontend(c: any): Categoria {
    return {
      id_categoria: c.id_categoria,
      nombre_categoria: c.nombre_categoria,
      descripcion: c.descripcion,
      activo: c.estado === 'ACTIVO'
    };
  }
}
