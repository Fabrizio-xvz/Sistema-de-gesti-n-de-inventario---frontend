import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MovimientoService } from '../../core/services/movimiento.service';
import { InventarioService } from '../../core/services/inventario.service';
import { ProductoService } from '../../core/services/producto.service';
import { ProveedorService } from '../../core/services/proveedor.service';
import { MovimientoPayload } from '../../core/models/movimiento.model';
import { Producto } from '../../core/models/producto.model';
import { Proveedor } from '../../core/models/proveedor.model';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ToastService } from '../../core/services/toast.service';

type TabMovimiento = 'entrada' | 'salida' | 'ajuste';
type TipoAjuste = 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO';

interface StockItem {
  id_producto: number;
  nombre_producto: string;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
}

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [FormsModule, DataTableComponent, StatusBadgeComponent],
  templateUrl: './movimientos.component.html',
  styleUrl: './movimientos.component.scss',
})
export class MovimientosComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly movimientoService = inject(MovimientoService);
  private readonly inventarioService = inject(InventarioService);
  private readonly productoService = inject(ProductoService);
  private readonly proveedorService = inject(ProveedorService);
  private readonly toastService = inject(ToastService);

  // Tabs
  protected tabActiva: TabMovimiento = 'entrada';

  // Data signals
  protected productosSignal = signal<Producto[]>([]);
  protected proveedoresSignal = signal<Proveedor[]>([]);
  protected stockSignal = signal<StockItem[]>([]);
  protected movimientosSignal = signal<any[]>([]);

  // Entrada form
  protected productoEntrada = signal<number>(0);
  protected cantidadEntrada = 10;
  protected costoUnitarioEntrada = 0;
  protected proveedorEntrada = signal<number>(0);
  protected motivoEntrada = 'Recepción de proveedor';
  protected observacionEntrada = '';

  // Salida form
  protected productoSalida = signal<number>(0);
  protected cantidadSalida = 1;
  protected motivoSalida = 'Venta';
  protected observacionSalida = '';

  // Ajuste form
  protected productoAjuste = signal<number>(0);
  protected tipoAjuste: TipoAjuste = 'AJUSTE_NEGATIVO';
  protected cantidadAjuste = 1;
  protected motivoAjuste = 'Revisión de conteo';
  protected observacionAjuste = '';

  // UI states
  protected guardando = signal(false);
  protected readonly productoFiltrado = signal<number | null>(null);

  ngOnInit(): void {
    this.cargarDatos();

    this.route.queryParams.subscribe(params => {
      const prodId = params['productoId'];
      const action = params['accion'];
      if (prodId) {
        const idNum = Number(prodId);
        this.productoEntrada.set(idNum);
        this.productoSalida.set(idNum);
        this.productoAjuste.set(idNum);
        
        if (action === 'historial') {
          this.productoFiltrado.set(idNum);
        } else {
          this.productoFiltrado.set(null);
          this.tabActiva = 'entrada';
        }
      } else {
        this.productoFiltrado.set(null);
      }
    });
  }

  cargarDatos(): void {
    this.productoService.getAll().subscribe({
      next: (data) => {
        this.productosSignal.set(data);
        if (data.length > 0 && !this.productoEntrada()) {
          this.productoEntrada.set(data[0].id_producto);
          this.productoSalida.set(data[0].id_producto);
          this.productoAjuste.set(data[0].id_producto);
        }
      },
      error: (err) => console.error('Error al cargar productos', err)
    });

    this.proveedorService.getAll().subscribe({
      next: (data) => {
        this.proveedoresSignal.set(data);
        if (data.length > 0 && !this.proveedorEntrada()) {
          this.proveedorEntrada.set(data[0].id_proveedor);
        }
      },
      error: (err) => console.error('Error al cargar proveedores', err)
    });

    this.cargarStock();
    this.cargarMovimientos();
  }

  cargarStock(): void {
    this.inventarioService.getAll().subscribe({
      next: (data) => this.stockSignal.set(data as any),
      error: (err) => console.error('Error al cargar stock', err)
    });
  }

  cargarMovimientos(): void {
    this.movimientoService.getAll().subscribe({
      next: (data) => this.movimientosSignal.set(data),
      error: (err) => console.error('Error al cargar movimientos', err)
    });
  }

  protected readonly movimientos = computed(() => {
    let list = this.movimientosSignal();
    const filterId = this.productoFiltrado();
    if (filterId !== null) {
      list = list.filter(m => m.id_producto === filterId);
    }
    return list.map((m) => {
      const producto = this.productosSignal().find(p => p.id_producto === m.id_producto);
      return {
        ...m,
        producto: producto ? `${producto.nombre_producto}` : 'Producto',
        tipoDisplay: this.tipoDisplay(m.tipo_movimiento)
      };
    });
  });

  protected tipoDisplay(tipo: string): string {
    const map: Record<string, string> = {
      'ENTRADA': 'entrada',
      'SALIDA': 'salida',
      'MERMA': 'ajuste',
      'AJUSTE_POSITIVO': 'entrada',
      'AJUSTE_NEGATIVO': 'salida'
    };
    return map[tipo] ?? tipo;
  }

  protected stockActual(productId: number): number {
    const item = this.stockSignal().find((s: any) => s.id_producto === productId);
    return item ? item.stock_actual : 0;
  }

  protected nuevoStockEntrada(): number {
    return this.stockActual(this.productoEntrada()) + Number(this.cantidadEntrada);
  }

  protected nuevoStockSalida(): number {
    return this.stockActual(this.productoSalida()) - Number(this.cantidadSalida);
  }

  protected nuevoStockAjuste(): number {
    const stock = this.stockActual(this.productoAjuste());
    return this.tipoAjuste === 'AJUSTE_POSITIVO' ? stock + Number(this.cantidadAjuste) : stock - Number(this.cantidadAjuste);
  }

  protected salidaInvalida(): boolean {
    return Number(this.cantidadSalida) > this.stockActual(this.productoSalida());
  }

  protected productoNombre(id: number): string {
    const p = this.productosSignal().find(prod => prod.id_producto === id);
    return p ? `${p.nombre_producto} ${p.presentacion}` : '';
  }

  protected proveedorNombre(id: number): string {
    const p = this.proveedoresSignal().find(prov => prov.id_proveedor === id);
    return p ? p.razon_social : '';
  }

  // ——— ACCIONES DE GUARDADO ———

  protected guardarEntrada(): void {
    if (this.guardando()) return;
    this.guardando.set(true);

    const payload: MovimientoPayload = {
      id_producto: this.productoEntrada(),
      tipo_movimiento: 'ENTRADA',
      cantidad: Number(this.cantidadEntrada),
      costo_unitario: Number(this.costoUnitarioEntrada),
      motivo: this.motivoEntrada,
      referencia: this.proveedorNombre(this.proveedorEntrada()) || null,
      observacion: this.observacionEntrada || null
    };

    this.movimientoService.create(payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.toastService.showSuccess('Entrada registrada con éxito. El stock ha sido actualizado.');
        this.cargarStock();
        this.cargarMovimientos();
      },
      error: (err) => {
        this.guardando.set(false);
        this.toastService.showError(err.error?.mensaje || 'Error al registrar la entrada.');
      }
    });
  }

  protected registrarSalida(): void {
    if (this.guardando() || this.salidaInvalida()) return;
    this.guardando.set(true);

    const payload: MovimientoPayload = {
      id_producto: this.productoSalida(),
      tipo_movimiento: 'SALIDA',
      cantidad: Number(this.cantidadSalida),
      motivo: this.motivoSalida,
      observacion: this.observacionSalida || null
    };

    this.movimientoService.create(payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.toastService.showSuccess('Salida registrada con éxito. El stock ha sido actualizado.');
        this.cargarStock();
        this.cargarMovimientos();
      },
      error: (err) => {
        this.guardando.set(false);
        this.toastService.showError(err.error?.mensaje || 'Error al registrar la salida.');
      }
    });
  }

  protected guardarAjuste(): void {
    if (this.guardando()) return;
    this.guardando.set(true);

    const payload: MovimientoPayload = {
      id_producto: this.productoAjuste(),
      tipo_movimiento: this.tipoAjuste,
      cantidad: Number(this.cantidadAjuste),
      motivo: this.motivoAjuste,
      observacion: this.observacionAjuste || null
    };

    this.movimientoService.create(payload).subscribe({
      next: () => {
        this.guardando.set(false);
        this.toastService.showSuccess('Ajuste registrado con éxito. El stock ha sido actualizado.');
        this.cargarStock();
        this.cargarMovimientos();
      },
      error: (err) => {
        this.guardando.set(false);
        this.toastService.showError(err.error?.mensaje || 'Error al registrar el ajuste.');
      }
    });
  }
}
