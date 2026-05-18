import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { movimientos, productos, proveedores, responsables } from '../../core/data/mock-data';
import { getInventarioByProductId, getProductoById, getProveedorById } from '../../core/data/mock-helpers';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

type TabMovimiento = 'entrada' | 'salida' | 'ajuste';
type TipoAjuste = 'Aumentar stock' | 'Disminuir stock';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [FormsModule, DataTableComponent, StatusBadgeComponent],
  templateUrl: './movimientos.component.html',
  styleUrl: './movimientos.component.scss',
})
export class MovimientosComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  protected tabActiva: TabMovimiento = 'entrada';
  protected productoEntrada = 1;
  protected cantidadEntrada = 10;
  protected proveedorEntrada = 1;

  protected productoSalida = 2;
  protected cantidadSalida = 2;
  protected responsableSalida = responsables[1];

  protected productoAjuste = 3;
  protected tipoAjuste: TipoAjuste = 'Disminuir stock';
  protected cantidadAjuste = 1;
  protected responsableAjuste = responsables[0];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const prodId = params['productoId'];
      const action = params['accion'];
      if (prodId) {
        const idNum = Number(prodId);
        this.productoEntrada = idNum;
        this.productoSalida = idNum;
        this.productoAjuste = idNum;
        
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

  protected readonly productos = productos;
  protected readonly proveedores = proveedores;
  protected readonly responsables = responsables;
  
  protected readonly productoFiltrado = signal<number | null>(null);

  protected readonly movimientos = computed(() => {
    let list = movimientos;
    const filterId = this.productoFiltrado();
    if (filterId !== null) {
      list = list.filter(m => m.productoId === filterId);
    }
    return list.map((movimiento) => ({
      ...movimiento,
      producto: getProductoById(movimiento.productoId)?.nombre ?? 'Producto',
    }));
  });

  protected stockActual(productId: number): number {
    return getInventarioByProductId(productId)?.stockActual ?? 0;
  }

  protected nuevoStockEntrada(): number {
    return this.stockActual(this.productoEntrada) + Number(this.cantidadEntrada);
  }

  protected nuevoStockSalida(): number {
    return this.stockActual(this.productoSalida) - Number(this.cantidadSalida);
  }

  protected nuevoStockAjuste(): number {
    const stock = this.stockActual(this.productoAjuste);
    return this.tipoAjuste === 'Aumentar stock' ? stock + Number(this.cantidadAjuste) : stock - Number(this.cantidadAjuste);
  }

  protected salidaInvalida(): boolean {
    return Number(this.cantidadSalida) > this.stockActual(this.productoSalida);
  }

  protected proveedorNombre(id: number): string {
    return getProveedorById(id)?.nombre ?? '';
  }
}
