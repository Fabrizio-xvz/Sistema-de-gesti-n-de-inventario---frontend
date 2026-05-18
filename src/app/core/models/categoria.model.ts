export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
  descripcion?: string | null;
  activo: boolean; 
}

export interface CategoriaPayload {
  nombre_categoria: string;
  descripcion?: string | null;
  activo?: boolean;
}

export interface InactivarPayload {
  motivo: string;
}
