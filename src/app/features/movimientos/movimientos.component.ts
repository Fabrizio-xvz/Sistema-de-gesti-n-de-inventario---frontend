import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
export class MovimientosComponent {
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

  protected readonly productos = productos;
  protected readonly proveedores = proveedores;
  protected readonly responsables = responsables;
  protected readonly movimientos = movimientos.slice(0, 5).map((movimiento) => ({
    ...movimiento,
    producto: getProductoById(movimiento.productoId)?.nombre ?? 'Producto',
  }));

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
