export type ProductStatus = 'disponible' | 'stock bajo' | 'agotado' | 'activo' | 'inactivo';
export type MovementType = 'entrada' | 'salida' | 'ajuste';
export type ReplenishmentPriority = 'urgente' | 'pronto' | 'planificado';

export interface Product {
  id: number;
  nombre: string;
  categoriaId: number;
  presentacion: string;
  precioVenta: number;
  proveedorId: number;
  estado: 'activo' | 'inactivo';
  notas: string;
}

export interface Category {
  id: number;
  nombre: string;
  descripcion: string;
  cantidadProductos: number;
  estado: 'activo' | 'inactivo';
}

export interface Supplier {
  id: number;
  nombre: string;
  contacto: string;
  telefono: string;
  correo: string;
  direccion: string;
  categoriaIds: number[];
  estado: 'activo' | 'inactivo';
  ultimaEntrega: string;
  notas: string;
}

export interface InventoryItem {
  productId: number;
  stockActual: number;
  stockMinimo: number;
  ultimoMovimiento: string;
}

export interface Movement {
  id: number;
  fecha: string;
  productoId: number;
  tipo: MovementType;
  cantidad: number;
  responsable: string;
  motivo: string;
  observacion: string;
}

export interface ReplenishmentItem {
  productId: number;
  stockActual: number;
  stockMinimo: number;
  cantidadSugerida: number;
  proveedorId: number;
  prioridad: ReplenishmentPriority;
  ultimaEntrada: string;
  revisadoHoy: boolean;
  nota: string;
}

export interface ReportSummary {
  totalEntradas: number;
  totalSalidas: number;
  stockBajo: number;
  agotados: number;
}
