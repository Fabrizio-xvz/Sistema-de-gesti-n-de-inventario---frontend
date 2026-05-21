export interface DetalleReposicion {
  id_detalle_reposicion?: number;
  id_producto: number;
  cantidad_solicitada: number;
  cantidad_recibida?: number;
  costo_unitario?: number;
}

export interface Reposicion {
  id_reposicion: number;
  codigo_reposicion: string;
  id_proveedor: number;
  estado_reposicion: string; // 'BORRADOR', 'SOLICITADA', 'RECIBIDA', 'ANULADA', 'CERRADA'
  fecha_solicitud: string;
  fecha_recepcion?: string | null;
  observacion?: string | null;
  detalles?: DetalleReposicion[];
}

export interface ReposicionPayload {
  codigo_reposicion: string;
  id_proveedor: number;
  observacion?: string | null;
  detalles: {
    id_producto: number;
    cantidad_solicitada: number;
    costo_unitario: number;
  }[];
}

export interface RecibirReposicionPayload {
  detalles: {
    id_detalle_reposicion: number;
    cantidad_recibida: number;
  }[];
  observacion?: string | null;
}
