import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { categorias, movimientos, movimientosPorMes, productos, resumenReporte } from '../../core/data/mock-data';
import { getProductoById } from '../../core/data/mock-helpers';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { SearchFilterBarComponent } from '../../shared/components/search-filter-bar/search-filter-bar.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [FormsModule, SearchFilterBarComponent, StatCardComponent, DataTableComponent, StatusBadgeComponent],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export class ReportesComponent {
  protected rango = '01/03/2026 - 31/03/2026';
  protected categoria = 'todas';
  protected producto = 'todos';
  protected tipo = 'todos';

  protected readonly categorias = categorias.map((item) => item.nombre);
  protected readonly productos = productos.map((item) => `${item.nombre} ${item.presentacion}`);
  protected readonly resumen = resumenReporte;
  protected readonly barras = movimientosPorMes;
  protected readonly categoriasGrafico = categorias.slice(0, 5);
  protected readonly movimientos = movimientos.slice(3).map((movimiento) => ({
    ...movimiento,
    producto: `${getProductoById(movimiento.productoId)?.nombre ?? ''} ${getProductoById(movimiento.productoId)?.presentacion ?? ''}`.trim(),
  }));

  protected totalGrafico(): number {
    return this.categoriasGrafico.reduce((total, item) => total + item.cantidadProductos, 0);
  }

  protected chartStyle(): string {
    const total = this.totalGrafico();
    let acumulado = 0;
    const colores = ['#2563eb', '#0f766e', '#f59e0b', '#dc2626', '#8b5cf6'];
    const segmentos = this.categoriasGrafico.map((item, index) => {
      const inicio = (acumulado / total) * 100;
      acumulado += item.cantidadProductos;
      const fin = (acumulado / total) * 100;
      return `${colores[index]} ${inicio}% ${fin}%`;
    });
    return `conic-gradient(${segmentos.join(', ')})`;
  }
}
