import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Proveedor } from '../models/proveedor.model';
import { proveedores } from '../data/mock-data';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {
  private mockProveedores: Proveedor[] = proveedores.map(p => ({
    id_proveedor: p.id,
    nombre_proveedor: p.nombre,
    contacto: p.contacto,
    telefono: p.telefono,
    correo: p.correo,
    direccion: p.direccion,
    activo: p.estado === 'activo'
  }));

  getAll(): Observable<Proveedor[]> {
    return of([...this.mockProveedores]).pipe(delay(400));
  }

  getById(id: number): Observable<Proveedor> {
    const prov = this.mockProveedores.find(p => p.id_proveedor === id);
    if (prov) {
      return of({ ...prov }).pipe(delay(200));
    }
    return throwError(() => new Error('Proveedor no encontrado'));
  }
}
