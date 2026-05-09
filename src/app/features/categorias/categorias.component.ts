import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { categorias } from '../../core/data/mock-data';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [FormsModule, StatusBadgeComponent],
  templateUrl: './categorias.component.html',
  styleUrl: './categorias.component.scss',
})
export class CategoriasComponent {
  protected busqueda = '';
  protected readonly iconos = ['◉', '◔', '◈', '◌', '◎', '◍', '◐'];

  protected get categoriasFiltradas() {
    return categorias.filter((categoria) => categoria.nombre.toLowerCase().includes(this.busqueda.toLowerCase()));
  }
}
