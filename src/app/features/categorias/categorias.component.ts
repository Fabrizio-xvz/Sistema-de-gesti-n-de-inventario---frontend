import { Component, inject, OnInit, signal, computed, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CategoriaService } from '../../core/services/categoria.service';
import { Categoria, CategoriaPayload } from '../../core/models/categoria.model';
import { CategoriaFormModalComponent } from './components/categoria-form-modal/categoria-form-modal.component';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [FormsModule, CommonModule, StatusBadgeComponent, CategoriaFormModalComponent],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.scss',
})
export class CategoriasComponent implements OnInit {
  private readonly categoriaService = inject(CategoriaService);
  
  @ViewChild('modal') modal!: CategoriaFormModalComponent;

  public categorias = signal<Categoria[]>([]);
  public busqueda = signal('');
  
  public readonly iconos = ['◉', '◔', '◈', '◌', '◎', '◍', '◐'];

  public categoriasFiltradas = computed(() => {
    const term = this.busqueda().toLowerCase();
    return this.categorias().filter((categoria) => 
      categoria.nombre_categoria.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categoriaService.getAll().subscribe({
      next: (data) => this.categorias.set(data),
      error: (err) => console.error('Error al cargar categorías', err)
    });
  }

  openNew(): void {
    this.modal.open();
  }

  openEdit(categoria: Categoria): void {
    this.modal.open(categoria);
  }

  onSave(event: { id?: number, data: CategoriaPayload }): void {
    if (event.id) {
      this.categoriaService.update(event.id, event.data).subscribe({
        next: (updated) => {
          this.categorias.update(cats => cats.map(c => c.id_categoria === updated.id_categoria ? updated : c));
          this.modal.close();
        },
        error: (err) => {
          console.error('Error al actualizar', err);
          this.modal.isSubmitting.set(false);
        }
      });
    } else {
      this.categoriaService.create(event.data).subscribe({
        next: (created) => {
          this.categorias.update(cats => [...cats, created]);
          this.modal.close();
        },
        error: (err) => {
          console.error('Error al crear', err);
          this.modal.isSubmitting.set(false);
        }
      });
    }
  }

  desactivarRapido(categoria: Categoria): void {
    if (!categoria.activo) return; // ya está inactivo
    
    this.categoriaService.inactivate(categoria.id_categoria, 'Desactivación manual').subscribe({
      next: (updated) => {
        this.categorias.update(cats => cats.map(c => c.id_categoria === updated.id_categoria ? updated : c));
      },
      error: (err) => console.error('Error al desactivar', err)
    });
  }
}
