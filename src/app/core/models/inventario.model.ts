export interface InventarioItem {
  id_producto: number;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo?: number | null;
  ultimo_movimiento: string;
}

export interface InventarioConfigPayload {
  stock_minimo: number;
  stock_maximo: number;
}
