import { Component, OnInit, signal, computed, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { SearchFilterBarComponent } from '../../shared/components/search-filter-bar/search-filter-bar.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ReposicionService } from '../../core/services/reposicion.service';
import { InventarioService } from '../../core/services/inventario.service';
import { ProductoService } from '../../core/services/producto.service';
import { ProveedorService } from '../../core/services/proveedor.service';
import { Reposicion, ReposicionPayload } from '../../core/models/reposicion.model';
import { Producto } from '../../core/models/producto.model';
import { Proveedor } from '../../core/models/proveedor.model';
import { ConfirmacionReposicionModalComponent } from './components/confirmacion-reposicion-modal/confirmacion-reposicion-modal.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-reposiciones',
  standalone: true,
  imports: [CommonModule, FormsModule, StatCardComponent, SearchFilterBarComponent, DataTableComponent, StatusBadgeComponent, ConfirmacionReposicionModalComponent],
  templateUrl: './reposiciones.component.html',
  styleUrl: './reposiciones.component.scss',
})
export class ReposicionesComponent implements OnInit {
  private readonly reposicionService = inject(ReposicionService);
  private readonly inventarioService = inject(InventarioService);
  private readonly productoService = inject(ProductoService);
  private readonly proveedorService = inject(ProveedorService);
  private readonly toastService = inject(ToastService);

  @ViewChild('modalConfirmacion') modalConfirmacion!: ConfirmacionReposicionModalComponent;

  protected tabActiva: 'sugerencias' | 'ordenes' = 'sugerencias';

  protected busqueda = '';
  protected proveedor = 'todos';
  protected categoria = 'todas';

  // Signals for lookup maps
  protected productosMap = signal<Map<number, Producto>>(new Map());
  protected proveedoresMap = signal<Map<number, Proveedor>>(new Map());

  // Data signals
  protected sugerencias = signal<any[]>([]);
  protected ordenes = signal<Reposicion[]>([]);
  
  protected seleccionadaSugerencia: any | null = null;
  protected seleccionadaOrden: Reposicion | null = null;

  ngOnInit(): void {
    this.cargarDatosMaestros().then(() => {
      this.cargarSugerencias();
      this.cargarOrdenes();
    });
  }

  private async cargarDatosMaestros() {
    this.productoService.getAll().subscribe(prods => {
      const map = new Map();
      prods.forEach(p => map.set(p.id_producto, p));
      this.productosMap.set(map);
    });
    this.proveedorService.getAll().subscribe(provs => {
      const map = new Map();
      provs.forEach(p => map.set(p.id_proveedor, p));
      this.proveedoresMap.set(map);
    });
  }

  protected cargarSugerencias(): void {
    this.inventarioService.getStockCritico().subscribe({
      next: (data) => {
        // Enriquecer data
        const enriquecida = data.map(item => {
          const prod = this.productosMap().get(item.id_producto);
          const provId = prod?.id_proveedor;
          const prov = provId ? this.proveedoresMap().get(provId) : null;
          return {
            ...item,
            producto: prod,
            proveedor: prov,
            prioridad: item.stock_actual <= 0 ? 'agotado' : 'stock bajo'
          };
        });
        this.sugerencias.set(enriquecida);
        if (enriquecida.length > 0 && !this.seleccionadaSugerencia) {
          this.seleccionadaSugerencia = enriquecida[0];
        }
      },
      error: err => console.error('Error al cargar stock critico', err)
    });
  }

  protected cargarOrdenes(): void {
    this.reposicionService.getAll().subscribe({
      next: (data) => this.ordenes.set(data),
      error: err => console.error('Error al cargar órdenes de reposición', err)
    });
  }

  protected get sugerenciasFiltradas() {
    return this.sugerencias().filter(item => {
      const prodNombre = item.producto?.nombre_producto ?? '';
      const provNombre = item.proveedor?.razon_social ?? '';
      const catNombre = item.producto?.id_categoria?.toString() ?? ''; // Idealmente cruzar con categorías
      
      const coincideTexto = prodNombre.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincideProv = this.proveedor === 'todos' || provNombre === this.proveedor;
      
      return coincideTexto && coincideProv;
    });
  }

  protected get ordenesFiltradas() {
    return this.ordenes();
  }

  // --- ACTIONS ---

  protected generarPedido(sugerencia: any): void {
    const prov = sugerencia.proveedor;
    if (!prov) {
      this.toastService.showError('El producto seleccionado no tiene un proveedor asociado.');
      return;
    }
    
    // Preparar el item para el modal
    const item = {
      producto: sugerencia.producto,
      cantidad_sugerida: sugerencia.cantidad_sugerida > 0 ? sugerencia.cantidad_sugerida : 10
    };

    this.modalConfirmacion.open(prov, [item]);
  }

  protected generarPedidoAgrupado(): void {
    if (!this.seleccionadaSugerencia) return;
    const prov = this.seleccionadaSugerencia.proveedor;
    if (!prov) return;

    // Obtener todas las sugerencias del mismo proveedor
    const items = this.sugerencias()
      .filter(s => s.proveedor?.id_proveedor === prov.id_proveedor)
      .map(s => ({
        producto: s.producto,
        cantidad_sugerida: s.cantidad_sugerida > 0 ? s.cantidad_sugerida : 10
      }));

    this.modalConfirmacion.open(prov, items);
  }

  protected onConfirmarPedido(payload: ReposicionPayload): void {
    this.reposicionService.create(payload).subscribe({
      next: () => {
        this.toastService.showSuccess('Pedido de reposición generado con éxito.');
        this.modalConfirmacion.close();
        this.cargarOrdenes();
        this.tabActiva = 'ordenes'; // Cambiar a la pestaña de órdenes
      },
      error: err => {
        this.toastService.showError(err.error?.mensaje || 'Error al generar pedido.');
        this.modalConfirmacion.isSubmitting.set(false);
      }
    });
  }

  protected solicitarOrden(orden: Reposicion): void {
    if (orden.estado_reposicion !== 'BORRADOR') return;
    this.reposicionService.updateEstado(orden.id_reposicion, 'SOLICITADA').subscribe({
      next: () => {
        this.toastService.showSuccess(`Orden ${orden.codigo_reposicion} enviada al proveedor.`);
        this.cargarOrdenes();
        this.seleccionadaOrden = null;
      },
      error: err => this.toastService.showError('Error al solicitar orden.')
    });
  }

  protected recibirOrden(orden: Reposicion): void {
    if (orden.estado_reposicion !== 'SOLICITADA') return;
    
    // Por simplicidad, recibimos la cantidad total solicitada.
    // En un sistema completo, habría un modal para verificar cantidades reales.
    const payload = {
      observacion: 'Recibido completamente',
      detalles: orden.detalles?.map(d => ({
        id_detalle_reposicion: d.id_detalle_reposicion!,
        cantidad_recibida: d.cantidad_solicitada
      })) || []
    };

    if (payload.detalles.length === 0) {
      this.toastService.showError('No se pueden cargar los detalles de la orden.');
      return;
    }

    this.reposicionService.recibir(orden.id_reposicion, payload).subscribe({
      next: () => {
        this.toastService.showSuccess(`Orden ${orden.codigo_reposicion} recibida. Stock actualizado.`);
        this.cargarOrdenes();
        this.cargarSugerencias(); // Refrescar porque el stock subió
        this.seleccionadaOrden = null;
      },
      error: err => this.toastService.showError('Error al recibir orden.')
    });
  }

  protected anularOrden(orden: Reposicion): void {
    if (orden.estado_reposicion === 'RECIBIDA' || orden.estado_reposicion === 'CERRADA' || orden.estado_reposicion === 'ANULADA') return;
    this.reposicionService.updateEstado(orden.id_reposicion, 'ANULADA', 'Anulada manualmente').subscribe({
      next: () => {
        this.toastService.showSuccess(`Orden ${orden.codigo_reposicion} anulada.`);
        this.cargarOrdenes();
        this.seleccionadaOrden = null;
      },
      error: err => this.toastService.showError(err.error?.mensaje || 'Error al anular orden.')
    });
  }

  protected get proveedoresActivos() {
    return Array.from(this.proveedoresMap().values());
  }

  // --- STATS ---
  protected get stats() {
    const s = this.sugerencias();
    const o = this.ordenes();
    return {
      sugerenciasCount: s.length,
      urgentesCount: s.filter(x => x.prioridad === 'agotado').length,
      enCamino: o.filter(x => x.estado_reposicion === 'SOLICITADA').length,
      completadasHoy: o.filter(x => x.estado_reposicion === 'RECIBIDA').length
    };
  }

  // To display the status correctly with app-status-badge
  protected statusDisplay(estado: string): string {
    const map: Record<string, string> = {
      'BORRADOR': 'borrador',
      'SOLICITADA': 'en camino',
      'RECIBIDA': 'completado',
      'ANULADA': 'anulado',
      'CERRADA': 'cerrado'
    };
    return map[estado] || estado.toLowerCase();
  }
}
