import {
  Category,
  InventoryItem,
  Movement,
  Product,
  ReplenishmentItem,
  ReportSummary,
  Supplier,
} from '../models/app.models';

export const responsables = ['Doña Julia', 'Carlos M.'];

export const categorias: Category[] = [
  { id: 1, nombre: 'Víveres', descripcion: 'Productos básicos de cocina y despensa.', cantidadProductos: 142, estado: 'activo' },
  { id: 2, nombre: 'Bebidas', descripcion: 'Bebidas frías y de consumo diario.', cantidadProductos: 86, estado: 'activo' },
  { id: 3, nombre: 'Snacks', descripcion: 'Galletas, dulces y piqueos.', cantidadProductos: 54, estado: 'activo' },
  { id: 4, nombre: 'Limpieza', descripcion: 'Productos para la limpieza del hogar.', cantidadProductos: 32, estado: 'activo' },
  { id: 5, nombre: 'Aseo personal', descripcion: 'Aseo y cuidado diario.', cantidadProductos: 45, estado: 'activo' },
  { id: 6, nombre: 'Lácteos y huevos', descripcion: 'Huevos, leche y derivados.', cantidadProductos: 28, estado: 'activo' },
  { id: 7, nombre: 'Enlatados', descripcion: 'Conservas y enlatados.', cantidadProductos: 21, estado: 'activo' },
];

export const proveedores: Supplier[] = [
  {
    id: 1,
    nombre: 'Distribuidora Central',
    contacto: 'Carlos Ruiz',
    telefono: '987 654 321',
    correo: 'pedidos@distribuidoracentral.pe',
    direccion: 'Av. Universitaria 1234, Los Olivos, Lima',
    categoriaIds: [1, 2],
    estado: 'activo',
    ultimaEntrega: '06/05/2026 08:30 a.m.',
    notas: 'Entregan martes y jueves por la mañana. Pedir con 24h de anticipación.',
  },
  {
    id: 2,
    nombre: 'Mayorista Norte',
    contacto: 'Rosa Paredes',
    telefono: '982 345 901',
    correo: 'ventas@mayoristanorte.pe',
    direccion: 'Av. Naranjal 465, Los Olivos, Lima',
    categoriaIds: [1, 3, 4],
    estado: 'activo',
    ultimaEntrega: '05/05/2026 10:10 a.m.',
    notas: 'Manejan promociones por volumen en productos de víveres.',
  },
  {
    id: 3,
    nombre: 'Lácteos del Valle',
    contacto: 'María Fernández',
    telefono: '976 444 882',
    correo: 'pedidos@lacteosdelvalle.pe',
    direccion: 'Jr. Huandoy 258, Independencia, Lima',
    categoriaIds: [6],
    estado: 'activo',
    ultimaEntrega: '07/05/2026 07:45 a.m.',
    notas: 'La leche llega temprano. Confirmar antes de las 6:00 p.m. del día anterior.',
  },
  {
    id: 4,
    nombre: 'Panadería El Trigo',
    contacto: 'Jorge Luis',
    telefono: '955 777 123',
    correo: 'contacto@eltrigo.pe',
    direccion: 'Av. Las Palmeras 894, Los Olivos, Lima',
    categoriaIds: [1],
    estado: 'activo',
    ultimaEntrega: '08/05/2026 06:20 a.m.',
    notas: 'Despacho diario para pan fresco y panes especiales.',
  },
  {
    id: 5,
    nombre: 'Bebidas Lima Norte',
    contacto: 'Andrea Salas',
    telefono: '989 222 401',
    correo: 'ventas@bebidaslimanorte.pe',
    direccion: 'Av. Izaguirre 2210, Los Olivos, Lima',
    categoriaIds: [2],
    estado: 'activo',
    ultimaEntrega: '04/05/2026 03:00 p.m.',
    notas: 'Ideal para reposición de gaseosas antes del fin de semana.',
  },
];

export const productos: Product[] = [
  { id: 1, nombre: 'Arroz Costeño', categoriaId: 1, presentacion: '1kg', precioVenta: 5.8, proveedorId: 1, estado: 'activo', notas: 'Rotación alta en compras semanales.' },
  { id: 2, nombre: 'Aceite Primor', categoriaId: 1, presentacion: '1L', precioVenta: 11.9, proveedorId: 1, estado: 'activo', notas: 'Mantener cerca del punto de venta principal.' },
  { id: 3, nombre: 'Leche Gloria', categoriaId: 6, presentacion: 'Lata', precioVenta: 4.3, proveedorId: 3, estado: 'activo', notas: 'Producto clave para reposición quincenal.' },
  { id: 4, nombre: 'Azúcar Rubia', categoriaId: 1, presentacion: '1kg', precioVenta: 4.8, proveedorId: 2, estado: 'activo', notas: 'Se agota rápido antes del domingo.' },
  { id: 5, nombre: 'Huevos Pardos', categoriaId: 6, presentacion: 'Docena', precioVenta: 9.9, proveedorId: 3, estado: 'activo', notas: 'Revisar bandejas por quiebre al recibir.' },
  { id: 6, nombre: 'Panela Cuadrada', categoriaId: 1, presentacion: '500g', precioVenta: 4.5, proveedorId: 1, estado: 'activo', notas: 'Venta frecuente los fines de semana.' },
  { id: 7, nombre: 'Fideos Don Vittorio', categoriaId: 1, presentacion: '500g', precioVenta: 2.4, proveedorId: 2, estado: 'activo', notas: 'Buena salida en combos familiares.' },
  { id: 8, nombre: 'Coca-Cola', categoriaId: 2, presentacion: '2L', precioVenta: 8.5, proveedorId: 5, estado: 'activo', notas: 'Sube la demanda los sábados por la tarde.' },
  { id: 9, nombre: 'Atún Florida', categoriaId: 7, presentacion: '140g', precioVenta: 4.9, proveedorId: 2, estado: 'activo', notas: 'Controlar fechas de vencimiento por lote.' },
  { id: 10, nombre: 'Galletas Soda', categoriaId: 3, presentacion: 'Paquete', precioVenta: 1.8, proveedorId: 2, estado: 'activo', notas: 'Ideal para venta en caja.' },
];

export const inventario: InventoryItem[] = [
  { productId: 1, stockActual: 24, stockMinimo: 12, ultimoMovimiento: 'Hoy 9:30 a.m.' },
  { productId: 2, stockActual: 18, stockMinimo: 8, ultimoMovimiento: 'Hoy 9:15 a.m.' },
  { productId: 3, stockActual: 9, stockMinimo: 10, ultimoMovimiento: 'Ayer 5:45 p.m.' },
  { productId: 4, stockActual: 0, stockMinimo: 8, ultimoMovimiento: 'Hoy 8:20 a.m.' },
  { productId: 5, stockActual: 2, stockMinimo: 6, ultimoMovimiento: 'Ayer 6:10 p.m.' },
  { productId: 6, stockActual: 13, stockMinimo: 5, ultimoMovimiento: '07/05/2026 4:00 p.m.' },
  { productId: 7, stockActual: 31, stockMinimo: 10, ultimoMovimiento: '06/05/2026 11:20 a.m.' },
  { productId: 8, stockActual: 7, stockMinimo: 6, ultimoMovimiento: 'Hoy 11:00 a.m.' },
  { productId: 9, stockActual: 11, stockMinimo: 5, ultimoMovimiento: '06/05/2026 2:35 p.m.' },
  { productId: 10, stockActual: 4, stockMinimo: 10, ultimoMovimiento: 'Hoy 10:05 a.m.' },
];

export const movimientos: Movement[] = [
  { id: 1, fecha: '08/05/2026 09:30 a.m.', productoId: 1, tipo: 'entrada', cantidad: 10, responsable: 'Doña Julia', motivo: 'Recepción de proveedor', observacion: 'Reposición semanal.' },
  { id: 2, fecha: '08/05/2026 09:15 a.m.', productoId: 2, tipo: 'salida', cantidad: 2, responsable: 'Carlos M.', motivo: 'Venta', observacion: 'Salida por venta mostrador.' },
  { id: 3, fecha: '07/05/2026 05:45 p.m.', productoId: 3, tipo: 'ajuste', cantidad: -1, responsable: 'Doña Julia', motivo: 'Producto dañado', observacion: 'Lata abollada separada.' },
  { id: 4, fecha: '15/03/2026 08:30 a.m.', productoId: 3, tipo: 'entrada', cantidad: 24, responsable: 'Julia R.', motivo: 'Recepción de proveedor', observacion: 'Ingreso de lote completo.' },
  { id: 5, fecha: '15/03/2026 10:15 a.m.', productoId: 8, tipo: 'salida', cantidad: 2, responsable: 'Carlos M.', motivo: 'Venta', observacion: 'Salida por venta.' },
  { id: 6, fecha: '14/03/2026 08:45 a.m.', productoId: 5, tipo: 'ajuste', cantidad: -1, responsable: 'Carlos M.', motivo: 'Producto dañado', observacion: 'Huevo roto en estante.' },
];

export const reposiciones: ReplenishmentItem[] = [
  { productId: 4, stockActual: 0, stockMinimo: 8, cantidadSugerida: 20, proveedorId: 2, prioridad: 'urgente', ultimaEntrada: '03/05/2026 09:00 a.m.', revisadoHoy: true, nota: 'Producto agotado desde esta mañana.' },
  { productId: 5, stockActual: 2, stockMinimo: 6, cantidadSugerida: 10, proveedorId: 3, prioridad: 'urgente', ultimaEntrada: '07/05/2026 07:45 a.m.', revisadoHoy: true, nota: 'Alta demanda en desayunos.' },
  { productId: 10, stockActual: 4, stockMinimo: 10, cantidadSugerida: 18, proveedorId: 2, prioridad: 'pronto', ultimaEntrada: '02/05/2026 12:20 p.m.', revisadoHoy: false, nota: 'Reforzar antes del fin de semana.' },
  { productId: 3, stockActual: 9, stockMinimo: 10, cantidadSugerida: 12, proveedorId: 3, prioridad: 'planificado', ultimaEntrada: '15/03/2026 08:30 a.m.', revisadoHoy: false, nota: 'Preparar siguiente pedido regular.' },
];

export const resumenReporte: ReportSummary = {
  totalEntradas: 248,
  totalSalidas: 392,
  stockBajo: 14,
  agotados: 3,
};

export const movimientosPorMes = [
  { nombre: 'Lun', entradas: 40, salidas: 52 },
  { nombre: 'Mar', entradas: 56, salidas: 64 },
  { nombre: 'Mié', entradas: 34, salidas: 48 },
  { nombre: 'Jue', entradas: 61, salidas: 55 },
  { nombre: 'Vie', entradas: 57, salidas: 73 },
];
