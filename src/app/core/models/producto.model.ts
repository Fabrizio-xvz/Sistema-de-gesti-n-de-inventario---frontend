export interface Producto {
  id_producto: number;
  codigo_producto?: string;
  nombre_producto: string;
  descripcion?: string | null;
  id_categoria: number;
  unidad_medida?: string;
  presentacion: string;          // mapped from unidad_medida for UI compatibility
  precio_venta: number;          // mapped from costo_unitario_actual
  costo_unitario_actual?: number;
  id_proveedor?: number;
  notas?: string | null;
  activo: boolean;
  estado?: string;               // 'ACTIVO' | 'INACTIVO' from backend
}

export interface ProductoPayload {
  codigo_producto?: string;
  nombre_producto: string;
  descripcion?: string | null;
  id_categoria: number;
  unidad_medida: string;
  costo_unitario_actual: number;
  // Frontend-only fields for product creation flow
  stock_inicial?: number | null;
  stock_minimo?: number | null;
}
