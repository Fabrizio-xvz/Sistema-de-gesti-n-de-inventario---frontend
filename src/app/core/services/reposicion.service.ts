import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reposicion, ReposicionPayload, RecibirReposicionPayload } from '../models/reposicion.model';

interface ApiResponse<T> {
  ok: boolean;
  mensaje: string;
  datos: T;
}

@Injectable({
  providedIn: 'root'
})
export class ReposicionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/reposiciones`;

  getAll(): Observable<Reposicion[]> {
    return this.http.get<ApiResponse<Reposicion[]>>(this.apiUrl).pipe(
      map(res => res.datos)
    );
  }

  getById(id: number): Observable<Reposicion> {
    return this.http.get<ApiResponse<Reposicion>>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.datos)
    );
  }

  create(data: ReposicionPayload): Observable<any> {
    return this.http.post<ApiResponse<any>>(this.apiUrl, data).pipe(
      map(res => res.datos)
    );
  }

  updateEstado(id: number, nuevoEstado: string, observacion?: string): Observable<any> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}/estado`, { nuevo_estado: nuevoEstado, observacion }).pipe(
      map(res => res.datos)
    );
  }

  recibir(id: number, payload: RecibirReposicionPayload): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/${id}/recibir`, payload).pipe(
      map(res => res.datos)
    );
  }
}
