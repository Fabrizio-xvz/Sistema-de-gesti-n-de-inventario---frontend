import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { categorias, proveedores } from '../../core/data/mock-data';
import { Supplier } from '../../core/models/app.models';
import { DrawerComponent } from '../../shared/components/drawer/drawer.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { SearchFilterBarComponent } from '../../shared/components/search-filter-bar/search-filter-bar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [FormsModule, SearchFilterBarComponent, DataTableComponent, DrawerComponent, StatusBadgeComponent],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss',
})
export class ProveedoresComponent {
  protected busqueda = '';
  protected categoria = 'todas';
  protected estado = 'todos';
  protected proveedorSeleccionado: Supplier | null = null;
  protected readonly categorias = categorias.map((item) => item.nombre);

  protected get filasFiltradas() {
    return proveedores.filter((proveedor) => {
      const nombreCategorias = proveedor.categoriaIds
        .map((id) => categorias.find((categoria) => categoria.id === id)?.nombre ?? '')
        .filter(Boolean);

      const coincideTexto = `${proveedor.nombre} ${proveedor.contacto}`.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincideCategoria = this.categoria === 'todas' || nombreCategorias.includes(this.categoria);
      const coincideEstado = this.estado === 'todos' || proveedor.estado === this.estado;
      return coincideTexto && coincideCategoria && coincideEstado;
    });
  }

  protected categoriasTexto(proveedor: Supplier): string {
    return proveedor.categoriaIds
      .map((id) => categorias.find((categoria) => categoria.id === id)?.nombre ?? '')
      .filter(Boolean)
      .join(', ');
  }
}
