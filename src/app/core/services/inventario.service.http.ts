import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventarioItem, InventarioConfigPayload } from '../models/inventario.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioHttpService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/inventario`;

  getAll(): Observable<InventarioItem[]> {
    return this.http.get<InventarioItem[]>(this.apiUrl);
  }

  updateConfig(productId: number, payload: InventarioConfigPayload): Observable<InventarioItem> {
    return this.http.put<InventarioItem>(`${this.apiUrl}/${productId}/configuracion`, payload);
  }
}
