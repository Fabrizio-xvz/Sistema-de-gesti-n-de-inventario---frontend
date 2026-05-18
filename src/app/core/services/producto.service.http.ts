import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Producto, ProductoPayload } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoHttpService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  getAll(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  getById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/${id}`);
  }

  create(data: ProductoPayload): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, data);
  }

  update(id: number, data: ProductoPayload): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, data);
  }
}
