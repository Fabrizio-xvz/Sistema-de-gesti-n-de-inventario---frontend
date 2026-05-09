import { Component, input } from '@angular/core';

@Component({
  selector: 'app-data-table',
  standalone: true,
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent {
  readonly titulo = input('');
  readonly subtitulo = input('');
}
