export interface Proveedor {
  id_proveedor: number;
  nombre_proveedor: string;
  contacto?: string | null;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
  activo: boolean;
}

export interface ProveedorPayload {
  nombre_proveedor: string;
  contacto?: string | null;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
  activo?: boolean;
}
