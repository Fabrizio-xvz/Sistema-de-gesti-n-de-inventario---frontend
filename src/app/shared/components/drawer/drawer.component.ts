import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-drawer',
  standalone: true,
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.scss',
})
export class DrawerComponent {
  readonly abierto = input(false);
  readonly titulo = input('');
  readonly cerrado = output<void>();
}
