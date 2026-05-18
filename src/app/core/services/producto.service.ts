import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Producto, ProductoPayload } from '../models/producto.model';
import { productos, inventario, movimientos } from '../data/mock-data';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private mockProductos: Producto[] = productos.map(p => ({
    id_producto: p.id,
    nombre_producto: p.nombre,
    id_categoria: p.categoriaId,
    presentacion: p.presentacion,
    precio_venta: p.precioVenta,
    id_proveedor: p.proveedorId,
    notas: p.notas,
    activo: p.estado === 'activo'
  }));

  private currentId = Math.max(...productos.map(p => p.id), 0) + 1;

  getAll(): Observable<Producto[]> {
    return of([...this.mockProductos]).pipe(delay(500));
  }

  getById(id: number): Observable<Producto> {
    const prod = this.mockProductos.find(p => p.id_producto === id);
    if (prod) {
      return of({ ...prod }).pipe(delay(300));
    }
    return throwError(() => new Error('Producto no encontrado'));
  }

  create(data: ProductoPayload): Observable<Producto> {
    const newId = this.currentId++;
    const newProd: Producto = {
      id_producto: newId,
      nombre_producto: data.nombre_producto,
      id_categoria: Number(data.id_categoria),
      presentacion: data.presentacion,
      precio_venta: Number(data.precio_venta),
      id_proveedor: Number(data.id_proveedor),
      notas: data.notas || '',
      activo: data.activo
    };

    // Añadir al catálogo local de productos
    this.mockProductos.push(newProd);

    // Mapear al mock-data principal de productos en formato original para compatibilidad con otras vistas
    productos.push({
      id: newId,
      nombre: newProd.nombre_producto,
      categoriaId: newProd.id_categoria,
      presentacion: newProd.presentacion,
      precioVenta: newProd.precio_venta,
      proveedorId: newProd.id_proveedor,
      estado: newProd.activo ? 'activo' : 'inactivo',
      notas: newProd.notas || ''
    });

    // Integración Logística Inicial (Stock Inicial / Stock Mínimo)
    const stockInicial = data.stock_inicial !== undefined && data.stock_inicial !== null ? Number(data.stock_inicial) : 0;
    const stockMinimo = data.stock_minimo !== undefined && data.stock_minimo !== null ? Number(data.stock_minimo) : 0;

    // Crear ítem de inventario
    inventario.push({
      productId: newId,
      stockActual: stockInicial,
      stockMinimo: stockMinimo,
      ultimoMovimiento: 'Hoy 10:40 a.m.'
    });

    // Registrar movimiento si el stock inicial es mayor que 0
    if (stockInicial > 0) {
      movimientos.unshift({
        id: Math.max(...movimientos.map(m => m.id), 0) + 1,
        fecha: 'Hoy 10:40 a.m.',
        productoId: newId,
        tipo: 'entrada',
        cantidad: stockInicial,
        responsable: 'Doña Julia',
        motivo: 'Inventario inicial',
        observacion: 'Registro automático de stock inicial para producto nuevo.'
      });
    }

    return of({ ...newProd }).pipe(delay(600));
  }

  update(id: number, data: ProductoPayload): Observable<Producto> {
    const index = this.mockProductos.findIndex(p => p.id_producto === id);
    if (index > -1) {
      const updatedProd: Producto = {
        ...this.mockProductos[index],
        nombre_producto: data.nombre_producto,
        id_categoria: Number(data.id_categoria),
        presentacion: data.presentacion,
        precio_venta: Number(data.precio_venta),
        id_proveedor: Number(data.id_proveedor),
        notas: data.notas || '',
        activo: data.activo
      };
      
      this.mockProductos[index] = updatedProd;

      // Actualizar también en la lista mock global para compatibilidad con las vistas
      const globalIndex = productos.findIndex(p => p.id === id);
      if (globalIndex > -1) {
        productos[globalIndex] = {
          id: id,
          nombre: updatedProd.nombre_producto,
          categoriaId: updatedProd.id_categoria,
          presentacion: updatedProd.presentacion,
          precioVenta: updatedProd.precio_venta,
          proveedorId: updatedProd.id_proveedor,
          estado: updatedProd.activo ? 'activo' : 'inactivo',
          notas: updatedProd.notas || ''
        };
      }

      return of({ ...updatedProd }).pipe(delay(500));
    }
    return throwError(() => new Error('Producto no encontrado'));
  }
}
