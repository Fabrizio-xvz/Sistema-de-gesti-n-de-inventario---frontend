import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  readonly icono = input('◉');
  readonly numero = input<string>('0');
  readonly titulo = input('');
  readonly color = input<'azul' | 'verde' | 'amarillo' | 'rojo'>('azul');
}
