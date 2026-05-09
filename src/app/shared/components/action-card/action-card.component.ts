import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-action-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './action-card.component.html',
  styleUrl: './action-card.component.scss',
})
export class ActionCardComponent {
  readonly icono = input('◉');
  readonly titulo = input('');
  readonly ruta = input('/dashboard');
}
