# Documentación Técnica: Módulo de Productos

Esta documentación detalla la arquitectura, el diseño de la interfaz de usuario, la gestión del estado reactivo y la lógica de integración del **Módulo de Productos (`features/productos`)**, construido en Angular utilizando las últimas características del framework (Signals, Standalone Components, Reactive Forms y HTML5 native Dialogs).

---

## 1. Descripción General

El Módulo de Productos permite administrar el catálogo maestro del sistema. El módulo está implementado como una **maqueta funcional reactiva de alta fidelidad (Mock)**, la cual simula tiempos de respuesta de red (RxJS `delay`) y realiza mapeos automáticos de inventario e historial de movimientos logísticos en memoria. Esto permite al usuario y a los desarrolladores interactuar con el flujo completo de inventariado antes de tener el servidor operativo.

---

## 2. Estructura de Directorios

El código sigue las mejores prácticas de modularización y desacoplamiento (Smart/Dumb Components) para facilitar su mantenimiento y escalabilidad futura:

```text
src/app/
├── core/
│   ├── models/
│   │   ├── producto.model.ts         # Modelos del API (snake_case)
│   │   └── proveedor.model.ts        # Modelos del API para selectores
│   │
│   └── services/
│       ├── producto.service.ts       # Servicio ACTIVO (Mock reactivo con RxJS)
│       ├── producto.service.http.ts  # Servicio DE RESPALDO (HTTP real para FastAPI)
│       ├── proveedor.service.ts      # Servicio ACTIVO de Proveedores (Mock)
│       └── proveedor.service.http.ts # Servicio DE RESPALDO de Proveedores (HTTP)
│
└── features/
    └── productos/
        ├── productos.component.ts    # Vista Principal (Smart) con Angular Signals
        ├── productos.component.html  # Vista Principal (Buscador, Filtros y Tabla)
        ├── productos.component.scss
        └── components/
            └── producto-form-modal/  # Formulario de Registro/Edición (Dumb Modal)
                ├── producto-form-modal.component.ts
                ├── producto-form-modal.component.html
                └── producto-form-modal.component.scss
```

---

## 3. Modelos de Datos (`snake_case` para Backend)

Los esquemas están diseñados para coincidir con la especificación `Pydantic` de FastAPI. Para evitar incompatibilidades visuales con las vistas y drawers existentes, la UI utiliza un mapeador transparente, mientras que los servicios y payloads se comunican con tipados estrictos del backend.

### 3.1. `producto.model.ts`
*   **`Producto`**: Representa la entidad almacenada en base de datos.
```typescript
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
```
*   **`ProductoPayload`**: Objeto enviado en peticiones de guardado (`POST` / `PUT`). Incluye propiedades logísticas condicionales.
```typescript
export interface ProductoPayload {
  nombre_producto: string;
  id_categoria: number;
  presentacion: string;
  precio_venta: number;
  id_proveedor: number;
  notas?: string | null;
  activo: boolean;
  stock_inicial?: number | null; // Opcional, solo en POST
  stock_minimo?: number | null;  // Opcional, solo en POST
}
```

### 3.2. `proveedor.model.ts`
*   **`Proveedor`** / **`ProveedorPayload`**: Estructuras limpias para selectores dinámicos.
```typescript
export interface Proveedor {
  id_proveedor: number;
  nombre_proveedor: string;
  contacto?: string | null;
  telefono?: string | null;
  correo?: string | null;
  direccion?: string | null;
  activo: boolean;
}
```

---

## 4. Instrucciones para la Integración con el Backend FastAPI

Cuando el backend real esté listo para integrarse, **el desarrollador a cargo de la conexión solo deberá realizar las siguientes sustituciones**:

### Paso 1: Cambiar el Servicio de Productos
1. Abrir `src/app/core/services/producto.service.http.ts` y copiar todo su contenido.
2. Abrir `src/app/core/services/producto.service.ts`, borrar todo y pegar el código copiado.
3. Renombrar la clase `ProductoHttpService` a `ProductoService`.

### Paso 2: Cambiar el Servicio de Proveedores
1. Abrir `src/app/core/services/proveedor.service.http.ts` y copiar todo su contenido.
2. Abrir `src/app/core/services/proveedor.service.ts`, borrar todo y pegar el código copiado.
3. Renombrar la clase `ProveedorHttpService` a `ProveedorService`.

> [!NOTE]
> **No es necesario modificar ningún componente, HTML, SCSS o lógica visual**. La UI detectará el cambio de firmas y se comunicará de forma inmediata con los controladores REST reales.

---

## 5. Funcionamiento de la Integración Logística Inicial

En la creación de un nuevo producto, el formulario expone dos campos opcionales: **Stock Inicial** y **Stock Mínimo**.

### Comportamiento del API esperado por la UI:
Al enviar un `POST /api/productos` con el `ProductoPayload`:
1. El backend crea el registro en la tabla `productos`.
2. Si `stock_inicial` o `stock_minimo` están presentes, el backend debe:
   - Crear un registro en la tabla `inventario` asociado al `id_producto`, definiendo `stock_actual = stock_inicial` y `stock_minimo = stock_minimo`.
   - Si `stock_inicial > 0`, debe registrar un movimiento inicial automático en la tabla `movimientos` de tipo `entrada` (ejemplo: Motivo: *"Inventario inicial"*, Cantidad: `stock_inicial`).

*En nuestra maqueta, `ProductoService.create()` imita exactamente esta lógica en memoria, agregando el producto al catálogo global, el stock en inventario y la entrada en la lista de movimientos.*

---

## 6. Detalles de Arquitectura de UI

### 6.1. Componente Principal (`ProductosComponent`)
*   **Gestión con Signals**: Utiliza `productosSignal` para almacenar la lista activa de productos de forma reactiva y `categoriasList` / `proveedoresList` para poblar los filtros dinámicos superiores sin recargar el DOM.
*   **Búsqueda e Historial Instantáneo**: A través del getter reactivo `filasFiltradas`, la tabla reacciona de forma fluida a las búsquedas de texto y filtros dinámicos (categoría, proveedor, estado) en memoria.
*   **Mapeador Visual**: Traduce los campos de la base de datos `snake_case` a `camelCase` para mantener la consistencia con las directivas del drawer y table preexistentes sin alterar estilos o estructuras.

### 6.2. Modal de Formulario (`ProductoFormModalComponent`)
*   **Dialog HTML5 Nativo**: La UI utiliza la API del navegador `<dialog #dialog>` junto con `.showModal()` y `.close()`, garantizando el mejor rendimiento gráfico sin dependencias pesadas.
*   **Formulario Reactivo**: Construido con `FormGroup`, posee validación interactiva que resalta campos en rojo e impide el guardado hasta que el formulario sea válido.
*   **Doble Columna Responsiva**: El formulario se presenta en una grilla sofisticada de dos columnas para pantallas de escritorio, y colapsa de manera fluida en dispositivos móviles mediante Media Queries de CSS.
*   **Desactivación Inteligente**: En modo creación, los inputs logísticos están habilitados. Al pasar a modo edición, los inputs de *Stock Inicial* y *Stock Mínimo* se ocultan y deshabilitan automáticamente para forzar que los incrementos de stock se realicen mediante la bitácora logística independiente, asegurando la consistencia e integridad de los datos.
