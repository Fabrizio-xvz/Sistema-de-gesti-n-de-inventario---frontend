import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { categorias, proveedores, reposiciones } from '../../core/data/mock-data';
import { ReplenishmentItem } from '../../core/models/app.models';
import { getProductoById, getProveedorById } from '../../core/data/mock-helpers';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { SearchFilterBarComponent } from '../../shared/components/search-filter-bar/search-filter-bar.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-reposiciones',
  standalone: true,
  imports: [FormsModule, StatCardComponent, SearchFilterBarComponent, DataTableComponent, StatusBadgeComponent],
  templateUrl: './reposiciones.component.html',
  styleUrl: './reposiciones.component.scss',
})
export class ReposicionesComponent {
  protected busqueda = '';
  protected prioridad = 'todas';
  protected proveedor = 'todos';
  protected categoria = 'todas';
  protected seleccionada: ReplenishmentItem | null = reposiciones[0];

  protected readonly categorias = categorias.map((item) => item.nombre);
  protected readonly proveedores = proveedores.map((item) => item.nombre);

  protected get itemsFiltrados() {
    return reposiciones.filter((item) => {
      const producto = getProductoById(item.productId);
      const proveedorNombre = getProveedorById(item.proveedorId)?.nombre ?? '';
      const categoriaNombre = producto ? categorias.find((cat) => cat.id === producto.categoriaId)?.nombre ?? '' : '';
      const coincideTexto = `${producto?.nombre ?? ''} ${producto?.presentacion ?? ''}`.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincidePrioridad = this.prioridad === 'todas' || item.prioridad === this.prioridad;
      const coincideProveedor = this.proveedor === 'todos' || proveedorNombre === this.proveedor;
      const coincideCategoria = this.categoria === 'todas' || categoriaNombre === this.categoria;
      return coincideTexto && coincidePrioridad && coincideProveedor && coincideCategoria;
    });
  }

  protected productoNombre(item: ReplenishmentItem): string {
    const producto = getProductoById(item.productId);
    return `${producto?.nombre ?? ''} ${producto?.presentacion ?? ''}`.trim();
  }

  protected proveedorDetalle(item: ReplenishmentItem) {
    return getProveedorById(item.proveedorId);
  }
}
