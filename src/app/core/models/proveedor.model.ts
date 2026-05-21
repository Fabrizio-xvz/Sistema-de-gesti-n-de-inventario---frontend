export interface Proveedor {
  id_proveedor: number;
  razon_social: string;
  ruc: string | null;
  telefono: string | null;
  correo_electronico: string | null;
  estado: string;          // 'ACTIVO' | 'INACTIVO' — viene del backend
  activo?: boolean;        // helper calculado en frontend
}

export interface ProveedorPayload {
  razon_social: string;
  ruc?: string | null;
  telefono?: string | null;
  correo_electronico?: string | null;
}

export interface InactivarPayload {
  motivo: string;
}
