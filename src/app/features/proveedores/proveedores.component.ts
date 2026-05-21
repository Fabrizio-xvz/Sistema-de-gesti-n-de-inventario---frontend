import { Component, OnInit, ViewChild, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Proveedor, ProveedorPayload } from '../../core/models/proveedor.model';
import { ProveedorService } from '../../core/services/proveedor.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { DrawerComponent } from '../../shared/components/drawer/drawer.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { SearchFilterBarComponent } from '../../shared/components/search-filter-bar/search-filter-bar.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ProveedorFormModalComponent } from './components/proveedor-form-modal/proveedor-form-modal.component';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [
    FormsModule,
    SearchFilterBarComponent,
    DataTableComponent,
    DrawerComponent,
    StatusBadgeComponent,
    ProveedorFormModalComponent
  ],
  templateUrl: './proveedores.component.html',
  styleUrl: './proveedores.component.scss',
})
export class ProveedoresComponent implements OnInit {
  private readonly proveedorService = inject(ProveedorService);
  private readonly categoriaService = inject(CategoriaService);

  @ViewChild('proveedorModal') modal!: ProveedorFormModalComponent;

  protected busqueda = '';
  protected estado = 'todos';
  protected proveedorSeleccionado: Proveedor | null = null;

  protected proveedoresSignal = signal<Proveedor[]>([]);
  protected cargando = signal(false);

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.cargando.set(true);
    this.proveedorService.getAll().subscribe({
      next: (data) => {
        this.proveedoresSignal.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar proveedores', err);
        this.cargando.set(false);
      }
    });
  }

  protected get filasFiltradas() {
    return this.proveedoresSignal().filter((proveedor) => {
      const coincideTexto = `${proveedor.razon_social} ${proveedor.ruc ?? ''}`.toLowerCase().includes(this.busqueda.toLowerCase());
      const estadoProv = proveedor.estado === 'ACTIVO' ? 'activo' : 'inactivo';
      const coincideEstado = this.estado === 'todos' || estadoProv === this.estado;
      return coincideTexto && coincideEstado;
    });
  }

  protected estadoDisplay(proveedor: Proveedor): string {
    return proveedor.estado === 'ACTIVO' ? 'activo' : 'inactivo';
  }

  protected openNew(): void {
    this.modal.open();
  }

  protected openEdit(proveedor: Proveedor): void {
    this.modal.open(proveedor);
  }

  protected onSave(event: { id?: number, data: ProveedorPayload }): void {
    if (event.id) {
      this.proveedorService.update(event.id, event.data).subscribe({
        next: (updated) => {
          this.proveedoresSignal.update(list => list.map(p => p.id_proveedor === updated.id_proveedor ? updated : p));
          if (this.proveedorSeleccionado?.id_proveedor === updated.id_proveedor) {
            this.proveedorSeleccionado = updated;
          }
          this.modal.close();
        },
        error: (err) => {
          console.error('Error al actualizar proveedor', err);
          this.modal.isSubmitting.set(false);
        }
      });
    } else {
      this.proveedorService.create(event.data).subscribe({
        next: (created) => {
          this.proveedoresSignal.update(list => [...list, created]);
          this.modal.close();
        },
        error: (err) => {
          console.error('Error al crear proveedor', err);
          this.modal.isSubmitting.set(false);
        }
      });
    }
  }

  protected desactivar(proveedor: Proveedor): void {
    if (proveedor.estado !== 'ACTIVO') return;

    this.proveedorService.inactivate(proveedor.id_proveedor, 'Desactivación manual').subscribe({
      next: (updated) => {
        this.proveedoresSignal.update(list => list.map(p => p.id_proveedor === updated.id_proveedor ? updated : p));
        if (this.proveedorSeleccionado?.id_proveedor === updated.id_proveedor) {
          this.proveedorSeleccionado = updated;
        }
      },
      error: (err) => console.error('Error al desactivar proveedor', err)
    });
  }
}
