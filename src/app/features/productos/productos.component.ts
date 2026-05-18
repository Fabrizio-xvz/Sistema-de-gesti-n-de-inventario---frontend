import { Component, OnInit, ViewChild, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/app.models';
import { Producto, ProductoPayload } from '../../core/models/producto.model';
import { ProductoService } from '../../core/services/producto.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { ProveedorService } from '../../core/services/proveedor.service';
import { formatCurrency, getCategoriaById, getInventarioByProductId, getProveedorById } from '../../core/data/mock-helpers';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { DrawerComponent } from '../../shared/components/drawer/drawer.component';
import { SearchFilterBarComponent } from '../../shared/components/search-filter-bar/search-filter-bar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ProductoFormModalComponent } from './components/producto-form-modal/producto-form-modal.component';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    SearchFilterBarComponent,
    DataTableComponent,
    DrawerComponent,
    StatusBadgeComponent,
    ProductoFormModalComponent
  ],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss',
})
export class ProductosComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly proveedorService = inject(ProveedorService);

  @ViewChild('productoModal') modal!: ProductoFormModalComponent;

  protected busqueda = '';
  protected categoria = 'todas';
  protected proveedor = 'todos';
  protected estado = 'todos';
  protected productoSeleccionado: Product | null = null;

  protected productosSignal = signal<Product[]>([]);
  protected categoriasList = signal<string[]>([]);
  protected proveedoresList = signal<string[]>([]);

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Cargar productos
    this.productoService.getAll().subscribe({
      next: (data) => {
        this.productosSignal.set(data.map(this.mapToProduct));
      },
      error: (err) => console.error('Error al cargar productos', err)
    });

    // Cargar categorías para filtros
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        this.categoriasList.set(data.filter(c => c.activo).map(c => c.nombre_categoria));
      },
      error: (err) => console.error('Error al cargar categorías para filtros', err)
    });

    // Cargar proveedores para filtros
    this.proveedorService.getAll().subscribe({
      next: (data) => {
        this.proveedoresList.set(data.filter(p => p.activo).map(p => p.nombre_proveedor));
      },
      error: (err) => console.error('Error al cargar proveedores para filtros', err)
    });
  }

  protected get filasFiltradas() {
    return this.productosSignal().filter((producto) => {
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

  protected openNew(): void {
    this.modal.open();
  }

  protected openEdit(product: Product): void {
    const productoBackend = this.mapToProducto(product);
    this.modal.open(productoBackend);
  }

  protected onSave(event: { id?: number, data: ProductoPayload }): void {
    if (event.id) {
      this.productoService.update(event.id, event.data).subscribe({
        next: (updated) => {
          const updatedProduct = this.mapToProduct(updated);
          this.productosSignal.update(list => list.map(p => p.id === updated.id_producto ? updatedProduct : p));
          
          if (this.productoSeleccionado && this.productoSeleccionado.id === updated.id_producto) {
            this.productoSeleccionado = updatedProduct;
          }
          
          this.modal.close();
        },
        error: (err) => {
          console.error('Error al actualizar producto', err);
          this.modal.isSubmitting.set(false);
        }
      });
    } else {
      this.productoService.create(event.data).subscribe({
        next: (created) => {
          const createdProduct = this.mapToProduct(created);
          this.productosSignal.update(list => [...list, createdProduct]);
          this.modal.close();
        },
        error: (err) => {
          console.error('Error al crear producto', err);
          this.modal.isSubmitting.set(false);
        }
      });
    }
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

  // Helpers de Mapeo
  private mapToProduct(p: Producto): Product {
    return {
      id: p.id_producto,
      nombre: p.nombre_producto,
      categoriaId: p.id_categoria,
      presentacion: p.presentacion,
      precioVenta: p.precio_venta,
      proveedorId: p.id_proveedor,
      estado: p.activo ? 'activo' : 'inactivo',
      notas: p.notas || ''
    };
  }

  private mapToProducto(p: Product): Producto {
    return {
      id_producto: p.id,
      nombre_producto: p.nombre,
      id_categoria: p.categoriaId,
      presentacion: p.presentacion,
      precio_venta: p.precioVenta,
      id_proveedor: p.proveedorId,
      notas: p.notas,
      activo: p.estado === 'activo'
    };
  }
}
