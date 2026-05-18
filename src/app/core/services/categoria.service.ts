import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Categoria, CategoriaPayload } from '../models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  // Datos simulados (Maqueta)
  private mockCategorias: Categoria[] = [
    { id_categoria: 1, nombre_categoria: 'Electrónicos', descripcion: 'Dispositivos y gadgets', activo: true },
    { id_categoria: 2, nombre_categoria: 'Ropa', descripcion: 'Prendas de vestir', activo: true },
    { id_categoria: 3, nombre_categoria: 'Hogar', descripcion: 'Artículos para el hogar', activo: false },
    { id_categoria: 4, nombre_categoria: 'Deportes', descripcion: 'Equipamiento deportivo', activo: true }
  ];

  private currentId = 5;

  getAll(): Observable<Categoria[]> {
    // Simula retardo de red de 500ms
    return of([...this.mockCategorias]).pipe(delay(500));
  }

  getById(id: number): Observable<Categoria> {
    const cat = this.mockCategorias.find(c => c.id_categoria === id);
    if (cat) {
      return of({...cat}).pipe(delay(300));
    }
    return throwError(() => new Error('Categoría no encontrada'));
  }

  create(data: CategoriaPayload): Observable<Categoria> {
    const newCat: Categoria = {
      id_categoria: this.currentId++,
      nombre_categoria: data.nombre_categoria,
      descripcion: data.descripcion,
      activo: data.activo !== undefined ? data.activo : true
    };
    this.mockCategorias.push(newCat);
    return of({...newCat}).pipe(delay(600));
  }

  update(id: number, data: CategoriaPayload): Observable<Categoria> {
    const index = this.mockCategorias.findIndex(c => c.id_categoria === id);
    if (index > -1) {
      const updatedCat: Categoria = {
        ...this.mockCategorias[index],
        nombre_categoria: data.nombre_categoria,
        descripcion: data.descripcion !== undefined ? data.descripcion : this.mockCategorias[index].descripcion,
        activo: data.activo !== undefined ? data.activo : this.mockCategorias[index].activo
      };
      this.mockCategorias[index] = updatedCat;
      return of({...updatedCat}).pipe(delay(500));
    }
    return throwError(() => new Error('Categoría no encontrada'));
  }

  inactivate(id: number, motivo: string = 'Desactivación manual'): Observable<Categoria> {
    const index = this.mockCategorias.findIndex(c => c.id_categoria === id);
    if (index > -1) {
      this.mockCategorias[index].activo = false;
      // Aquí se usaría el 'motivo' si la maqueta guardara el histórico
      return of({...this.mockCategorias[index]}).pipe(delay(400));
    }
    return throwError(() => new Error('Categoría no encontrada'));
  }
}
