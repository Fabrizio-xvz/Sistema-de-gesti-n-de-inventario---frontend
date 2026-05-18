import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { inventario } from '../data/mock-data';
import { InventarioItem, InventarioConfigPayload } from '../models/inventario.model';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  
  getAll(): Observable<InventarioItem[]> {
    const list: InventarioItem[] = inventario.map(item => ({
      id_producto: item.productId,
      stock_actual: item.stockActual,
      stock_minimo: item.stockMinimo,
      stock_maximo: item.stockMaximo || (item.stockMinimo * 4 || 50),
      ultimo_movimiento: item.ultimoMovimiento
    }));
    return of(list).pipe(delay(200));
  }

  updateConfig(productId: number, payload: InventarioConfigPayload): Observable<InventarioItem> {
    const item = inventario.find(i => i.productId === productId);
    if (!item) {
      throw new Error(`Ítem no encontrado en inventario con id: ${productId}`);
    }

    // Actualizar mock en memoria
    item.stockMinimo = payload.stock_minimo;
    item.stockMaximo = payload.stock_maximo;
    item.ultimoMovimiento = 'Hoy config.';

    const updatedBackend: InventarioItem = {
      id_producto: item.productId,
      stock_actual: item.stockActual,
      stock_minimo: item.stockMinimo,
      stock_maximo: item.stockMaximo,
      ultimo_movimiento: item.ultimoMovimiento
    };

    return of(updatedBackend).pipe(
      delay(400),
      tap(() => console.log('Configuración de alertas modificada reactivamente', updatedBackend))
    );
  }
}
