export interface Producto {
  id_producto: number;
  nombre_producto: string;
  id_categoria: number;
  presentacion: string;
  precio_venta: number;
  id_proveedor: number;
  notas?: string | null;
  activo: boolean;
}

export interface ProductoPayload {
  nombre_producto: string;
  id_categoria: number;
  presentacion: string;
  precio_venta: number;
  id_proveedor: number;
  notas?: string | null;
  activo: boolean;
  stock_inicial?: number | null;
  stock_minimo?: number | null;
}
