import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  readonly estado = input('');

  protected tone(): string {
    const valor = this.estado().toLowerCase();

    if (['disponible', 'activo', 'planificado'].includes(valor)) {
      return 'green';
    }

    if (['stock bajo', 'pronto', 'ajuste'].includes(valor)) {
      return 'yellow';
    }

    if (['agotado', 'inactivo', 'salida', 'urgente'].includes(valor)) {
      return 'red';
    }

    if (valor === 'entrada') {
      return 'blue';
    }

    return 'neutral';
  }
}
