import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { inventario, productos } from '../../core/data/mock-data';
import { getCategoriaById, getEstadoStock, getProductoById } from '../../core/data/mock-helpers';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { SearchFilterBarComponent } from '../../shared/components/search-filter-bar/search-filter-bar.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [FormsModule, StatCardComponent, SearchFilterBarComponent, DataTableComponent, StatusBadgeComponent],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss',
})
export class InventarioComponent {
  protected busqueda = '';
  protected categoria = 'todas';
  protected estado = 'todos';
  protected orden = 'nombre';

  protected readonly filas = inventario.map((item) => {
    const producto = getProductoById(item.productId);
    return {
      ...item,
      nombre: producto?.nombre ?? 'Producto',
      presentacion: producto?.presentacion ?? '',
      categoria: getCategoriaById(producto?.categoriaId ?? 0)?.nombre ?? '',
      estado: getEstadoStock(item.stockActual, item.stockMinimo),
    };
  });

  protected get filasFiltradas() {
    return this.filas
      .filter((fila) => {
        const coincideTexto = `${fila.nombre} ${fila.presentacion}`.toLowerCase().includes(this.busqueda.toLowerCase());
        const coincideCategoria = this.categoria === 'todas' || fila.categoria === this.categoria;
        const coincideEstado = this.estado === 'todos' || fila.estado === this.estado;
        return coincideTexto && coincideCategoria && coincideEstado;
      })
      .sort((a, b) => {
        if (this.orden === 'stock') {
          return a.stockActual - b.stockActual;
        }

        if (this.orden === 'movimiento') {
          return a.ultimoMovimiento.localeCompare(b.ultimoMovimiento);
        }

        return a.nombre.localeCompare(b.nombre);
      });
  }

  protected readonly categorias = [...new Set(productos.map((producto) => getCategoriaById(producto.categoriaId)?.nombre ?? ''))].filter(Boolean);
}
