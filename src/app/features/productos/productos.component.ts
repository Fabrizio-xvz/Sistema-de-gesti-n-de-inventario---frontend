import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { productos, proveedores } from '../../core/data/mock-data';
import { Product } from '../../core/models/app.models';
import { formatCurrency, getCategoriaById, getInventarioByProductId, getProveedorById } from '../../core/data/mock-helpers';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { DrawerComponent } from '../../shared/components/drawer/drawer.component';
import { SearchFilterBarComponent } from '../../shared/components/search-filter-bar/search-filter-bar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule, RouterLink, SearchFilterBarComponent, DataTableComponent, DrawerComponent, StatusBadgeComponent],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss',
})
export class ProductosComponent {
  protected busqueda = '';
  protected categoria = 'todas';
  protected proveedor = 'todos';
  protected estado = 'todos';
  protected productoSeleccionado: Product | null = null;

  protected readonly categorias = [...new Set(productos.map((producto) => getCategoriaById(producto.categoriaId)?.nombre ?? ''))].filter(Boolean);
  protected readonly listaProveedores = proveedores.map((item) => item.nombre);

  protected get filasFiltradas() {
    return productos.filter((producto) => {
      const coincideTexto = `${producto.nombre} ${producto.presentacion}`.toLowerCase().includes(this.busqueda.toLowerCase());
      const nombreCategoria = getCategoriaById(producto.categoriaId)?.nombre ?? '';
      const nombreProveedor = getProveedorById(producto.proveedorId)?.nombre ?? '';
      const coincideCategoria = this.categoria === 'todas' || nombreCategoria === this.categoria;
      const coincideProveedor = this.proveedor === 'todos' || nombreProveedor === this.proveedor;
      const coincideEstado = this.estado === 'todos' || producto.estado === this.estado;
      return coincideTexto && coincideCategoria && coincideProveedor && coincideEstado;
    });
  }

  protected abrirDetalle(producto: Product): void {
    this.productoSeleccionado = producto;
  }

  protected cerrarDetalle(): void {
    this.productoSeleccionado = null;
  }

  protected categoriaNombre(producto: Product): string {
    return getCategoriaById(producto.categoriaId)?.nombre ?? '-';
  }

  protected proveedorNombre(producto: Product): string {
    return getProveedorById(producto.proveedorId)?.nombre ?? '-';
  }

  protected resumenInventario(producto: Product) {
    return getInventarioByProductId(producto.id);
  }

  protected formatoMoneda = formatCurrency;
}
