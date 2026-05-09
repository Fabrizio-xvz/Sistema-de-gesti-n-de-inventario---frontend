import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface SidebarItem {
  etiqueta: string;
  ruta: string;
  icono: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  protected readonly items: SidebarItem[] = [
    { etiqueta: 'Inicio', ruta: '/dashboard', icono: '⌂' },
    { etiqueta: 'Inventario', ruta: '/inventario', icono: '▦' },
    { etiqueta: 'Productos', ruta: '/productos', icono: '◫' },
    { etiqueta: 'Categorías', ruta: '/categorias', icono: '◉' },
    { etiqueta: 'Movimientos', ruta: '/movimientos', icono: '⇄' },
    { etiqueta: 'Reposiciones', ruta: '/reposiciones', icono: '↺' },
    { etiqueta: 'Proveedores', ruta: '/proveedores', icono: '☏' },
    { etiqueta: 'Reportes', ruta: '/reportes', icono: '▤' },
  ];
}
