import { categorias, inventario, productos, proveedores } from './mock-data';
import { Category, InventoryItem, Product, Supplier } from '../models/app.models';

export const getCategoriaById = (id: number): Category | undefined =>
  categorias.find((categoria) => categoria.id === id);

export const getProveedorById = (id: number): Supplier | undefined =>
  proveedores.find((proveedor) => proveedor.id === id);

export const getProductoById = (id: number): Product | undefined =>
  productos.find((producto) => producto.id === id);

export const getInventarioByProductId = (productId: number): InventoryItem | undefined =>
  inventario.find((item) => item.productId === productId);

export const getEstadoStock = (stockActual: number, stockMinimo: number): 'disponible' | 'stock bajo' | 'agotado' => {
  if (stockActual <= 0) {
    return 'agotado';
  }

  if (stockActual <= stockMinimo) {
    return 'stock bajo';
  }

  return 'disponible';
};

export const formatCurrency = (valor: number): string => `S/ ${valor.toFixed(2)}`;
