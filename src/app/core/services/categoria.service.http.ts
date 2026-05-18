import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria, CategoriaPayload, InactivarPayload } from '../models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaHttpService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/categorias`;

  getAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  getById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  create(data: CategoriaPayload): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, data);
  }

  update(id: number, data: CategoriaPayload): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, data);
  }

  inactivate(id: number, motivo: string = 'Desactivación manual'): Observable<Categoria> {
    const payload: InactivarPayload = { motivo };
    return this.http.patch<Categoria>(`${this.apiUrl}/${id}/inactivar`, payload);
  }
}
