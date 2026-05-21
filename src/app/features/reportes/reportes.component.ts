import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ReporteService } from '../../core/services/reporte.service';
import { MovimientoService } from '../../core/services/movimiento.service';
import { ProductoService } from '../../core/services/producto.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { SearchFilterBarComponent } from '../../shared/components/search-filter-bar/search-filter-bar.component';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ExportService } from '../../core/services/export.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, SearchFilterBarComponent, StatCardComponent, DataTableComponent, StatusBadgeComponent],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export class ReportesComponent implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly movimientoService = inject(MovimientoService);
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly exportService = inject(ExportService);

  // Filters
  protected rango = 'Últimos 30 días';
  protected categoria = 'todas';
  protected producto = 'todos';
  protected tipo = 'todos';

  // Dropdown lists
  protected categorias = signal<any[]>([]);
  protected productos = signal<any[]>([]);

  // Stats
  protected totalEntradas = signal<number>(0);
  protected totalSalidas = signal<number>(0);
  protected stockBajo = signal<number>(0);
  protected agotados = signal<number>(0);

  // Charts data
  protected valorizacionData: ChartData<'bar'> = { labels: [], datasets: [] };
  protected rotacionData: ChartData<'pie'> = { labels: [], datasets: [] };
  
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' }
    }
  };

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'right' }
    }
  };

  // Movements for table
  protected movimientosList = signal<any[]>([]);

  ngOnInit(): void {
    this.cargarFiltros();
    this.cargarReportes();
    this.cargarMovimientos();
  }

  private cargarFiltros(): void {
    this.categoriaService.getAll().subscribe(data => this.categorias.set(data));
    this.productoService.getAll().subscribe(data => this.productos.set(data));
  }

  private cargarReportes(): void {
    // Stock Crítico para los contadores
    this.reporteService.getStockCritico().subscribe({
      next: (data) => {
        this.agotados.set(data.filter((d: any) => d.stock_actual <= 0).length);
        this.stockBajo.set(data.filter((d: any) => d.stock_actual > 0 && d.stock_actual <= d.stock_minimo).length);
      }
    });

    // Valorización (Barras)
    this.reporteService.getValorizacion().subscribe({
      next: (data) => {
        // Asumiendo que retorna: [{ nombre_producto, valor_total_stock }]
        const topData = data.slice(0, 8); // Tomar top 8
        this.valorizacionData = {
          labels: topData.map(d => d.nombre_producto),
          datasets: [{
            data: topData.map(d => d.valor_total_stock),
            label: 'Valor Total (S/)',
            backgroundColor: '#3b82f6',
            borderRadius: 6
          }]
        };
      }
    });

    // Rotación (Pie/Donut)
    this.reporteService.getRotacion().subscribe({
      next: (data) => {
        // Asumiendo que retorna: [{ nombre_producto, total_salidas }]
        const topData = data.slice(0, 5); // Tomar top 5
        this.rotacionData = {
          labels: topData.map(d => d.nombre_producto),
          datasets: [{
            data: topData.map(d => d.total_salidas),
            backgroundColor: ['#2563eb', '#0f766e', '#f59e0b', '#dc2626', '#8b5cf6'],
            borderWidth: 0
          }]
        };
      }
    });
  }

  private cargarMovimientos(): void {
    this.movimientoService.getAll().subscribe({
      next: (data) => {
        let entradas = 0;
        let salidas = 0;
        
        // Mapear el nombre del producto
        const enriquecido = data.map(m => {
          const prod = this.productos().find(p => p.id_producto === m.id_producto);
          
          if (m.tipo_movimiento === 'ENTRADA' || m.tipo_movimiento === 'AJUSTE_POSITIVO') entradas++;
          if (m.tipo_movimiento === 'SALIDA' || m.tipo_movimiento === 'AJUSTE_NEGATIVO') salidas++;

          return {
            ...m,
            producto: prod ? prod.nombre_producto : `Producto #${m.id_producto}`,
            tipoDisplay: this.tipoDisplay(m.tipo_movimiento)
          };
        });
        
        this.totalEntradas.set(entradas);
        this.totalSalidas.set(salidas);
        this.movimientosList.set(enriquecido.slice(0, 20)); // Mostrar solo recientes en el reporte
      }
    });
  }

  protected get movimientosFiltrados() {
    return this.movimientosList().filter(m => {
      const matchProd = this.producto === 'todos' || m.producto === this.producto;
      const matchTipo = this.tipo === 'todos' || m.tipoDisplay === this.tipo;
      return matchProd && matchTipo;
    });
  }

  protected tipoDisplay(tipo: string): string {
    const map: Record<string, string> = {
      'ENTRADA': 'entrada',
      'SALIDA': 'salida',
      'MERMA': 'ajuste',
      'AJUSTE_POSITIVO': 'entrada',
      'AJUSTE_NEGATIVO': 'salida'
    };
    return map[tipo] ?? tipo.toLowerCase();
  }

  protected exportarExcel(): void {
    const data = this.movimientosFiltrados.map(m => ({
      Fecha: new Date(m.fecha_movimiento).toLocaleString(),
      Producto: m.producto,
      Tipo: m.tipoDisplay,
      Cantidad: m.cantidad,
      Observacion: m.observacion ?? m.motivo ?? ''
    }));
    this.exportService.exportToExcel(data, 'Reporte_Movimientos');
  }

  protected exportarPdf(): void {
    const headers = ['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Observación'];
    const data = this.movimientosFiltrados.map(m => [
      new Date(m.fecha_movimiento).toLocaleString(),
      m.producto,
      m.tipoDisplay,
      m.cantidad.toString(),
      m.observacion ?? m.motivo ?? ''
    ]);
    this.exportService.exportToPdf(headers, data, 'Reporte_Movimientos', 'Reporte de Movimientos de Inventario');
  }
}
