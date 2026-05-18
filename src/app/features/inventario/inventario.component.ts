import { Component, OnInit, ViewChild, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { getCategoriaById, getEstadoStock, getProductoById } from '../../core/data/mock-helpers';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { SearchFilterBarComponent } from '../../shared/components/search-filter-bar/search-filter-bar.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { InventarioService } from '../../core/services/inventario.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { InventarioItem, InventarioConfigPayload } from '../../core/models/inventario.model';
import { InventarioConfigModalComponent } from './components/inventario-config-modal/inventario-config-modal.component';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    FormsModule,
    StatCardComponent,
    SearchFilterBarComponent,
    DataTableComponent,
    StatusBadgeComponent,
    InventarioConfigModalComponent
  ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss',
})
export class InventarioComponent implements OnInit {
  private readonly inventarioService = inject(InventarioService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly router = inject(Router);

  @ViewChild('configModal') configModal!: InventarioConfigModalComponent;

  protected busqueda = '';
  protected categoria = 'todas';
  protected estado = 'todos';
  protected orden = 'nombre';

  protected inventarioSignal = signal<InventarioItem[]>([]);
  protected categoriasList = signal<string[]>([]);
  protected soloCriticos = signal(false);

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.inventarioService.getAll().subscribe({
      next: (data) => this.inventarioSignal.set(data),
      error: (err) => console.error('Error al cargar inventario', err)
    });

    this.categoriaService.getAll().subscribe({
      next: (data) => this.categoriasList.set(data.filter(c => c.activo).map(c => c.nombre_categoria)),
      error: (err) => console.error('Error al cargar categorias en filtros de inventario', err)
    });
  }

  protected readonly filas = computed(() => {
    return this.inventarioSignal().map((item) => {
      const producto = getProductoById(item.id_producto);
      return {
        productId: item.id_producto,
        nombre: producto?.nombre ?? 'Producto',
        presentacion: producto?.presentacion ?? '',
        categoria: getCategoriaById(producto?.categoriaId ?? 0)?.nombre ?? '',
        stockActual: item.stock_actual,
        stockMinimo: item.stock_minimo,
        stockMaximo: item.stock_maximo,
        estado: getEstadoStock(item.stock_actual, item.stock_minimo),
        ultimoMovimiento: item.ultimo_movimiento
      };
    });
  });

  protected get filasFiltradas() {
    return this.filas()
      .filter((fila) => {
        const coincideTexto = `${fila.nombre} ${fila.presentacion}`.toLowerCase().includes(this.busqueda.toLowerCase());
        const coincideCategoria = this.categoria === 'todas' || fila.categoria === this.categoria;
        
        let coincideEstado = this.estado === 'todos' || fila.estado === this.estado;
        if (this.soloCriticos()) {
          coincideEstado = fila.estado === 'stock bajo' || fila.estado === 'agotado';
        }

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

  protected readonly totalDisponibles = computed(() =>
    this.filas().filter(f => f.estado === 'disponible').length
  );
  protected readonly totalStockBajo = computed(() =>
    this.filas().filter(f => f.estado === 'stock bajo').length
  );
  protected readonly totalAgotados = computed(() =>
    this.filas().filter(f => f.estado === 'agotado').length
  );

  protected registrarMovimiento(): void {
    this.router.navigate(['/movimientos']);
  }

  protected toggleCriticos(): void {
    this.soloCriticos.update(val => !val);
  }

  protected openConfig(fila: any): void {
    this.configModal.open(fila);
  }

  protected onSaveConfig(event: { productId: number, data: InventarioConfigPayload }): void {
    this.inventarioService.updateConfig(event.productId, event.data).subscribe({
      next: (updated) => {
        this.inventarioSignal.update(list => list.map(item => item.id_producto === updated.id_producto ? updated : item));
        this.configModal.close();
      },
      error: (err) => {
        console.error('Error al actualizar alertas del inventario', err);
        this.configModal.isSubmitting.set(false);
      }
    });
  }

  protected movimientoRapido(productId: number): void {
    this.router.navigate(['/movimientos'], { queryParams: { productoId: productId } });
  }

  protected historial(productId: number): void {
    this.router.navigate(['/movimientos'], { queryParams: { productoId: productId, accion: 'historial' } });
  }
}
