import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { movimientos } from '../../core/data/mock-data';
import { getProductoById } from '../../core/data/mock-helpers';
import { ActionCardComponent } from '../../shared/components/action-card/action-card.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, StatCardComponent, ActionCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  protected readonly actividad = movimientos.slice(0, 3).map((movimiento) => ({
    nombre: getProductoById(movimiento.productoId)?.nombre ?? 'Producto',
    presentacion: getProductoById(movimiento.productoId)?.presentacion ?? '',
    descripcion:
      movimiento.tipo === 'entrada'
        ? `Entrada de ${movimiento.cantidad} unidades`
        : movimiento.tipo === 'salida'
          ? `Salida de ${Math.abs(movimiento.cantidad)} unidades (${movimiento.motivo})`
          : `Ajuste de inventario: ${movimiento.cantidad} unidad`,
    fecha:
      movimiento.id === 1 ? 'Hoy 9:30 a.m.' : movimiento.id === 2 ? 'Hoy 9:15 a.m.' : 'Ayer 5:45 p.m.',
  }));
}
