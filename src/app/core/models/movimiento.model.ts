export interface Movimiento {
  id_movimiento: number;
  id_producto: number;
  tipo_movimiento: string;
  cantidad: number;
  costo_unitario: number | null;
  motivo: string;
  referencia: string | null;
  observacion: string | null;
}

export interface MovimientoPayload {
  id_producto: number;
  tipo_movimiento: string;   // 'ENTRADA' | 'SALIDA' | 'AJUSTE'
  cantidad: number;
  costo_unitario?: number | null;
  motivo: string;
  referencia?: string | null;
  observacion?: string | null;
}
