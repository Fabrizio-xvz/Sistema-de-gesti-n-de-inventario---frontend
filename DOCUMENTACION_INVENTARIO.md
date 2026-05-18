# Documentación Técnica: Módulo de Inventario

Esta documentación detalla la arquitectura, el diseño de la interfaz de usuario, la gestión del estado reactivo, la validación avanzada de rangos de stock y el atajo de **Movimiento Rápido** en el **Módulo de Inventario (`features/inventario`)**, desarrollado en Angular utilizando Signals y componentes autónomos.

---

## 1. Descripción General

El Módulo de Inventario centraliza la visualización de existencias y la administración de parámetros logísticos críticos. Hemos implementado:
1.  **Parámetros Logísticos Personalizables**: Un modal interactivo para configurar de manera independiente los umbrales de **Stock Mínimo** (alerta de reposición) y **Stock Máximo** (capacidad bodega).
2.  **Paneles y Contadores Dinámicos**: Tarjetas de resumen que calculan en tiempo real el total de productos disponibles, stock bajo y agotados consumiendo Signals.
3.  **Movimiento Rápido Integrado (SPA)**: Atajo directo en la grilla que redirige a la bitácora de transacciones pre-seleccionando el producto correspondiente.

---

## 2. Estructura de Directorios del Desarrollo

```text
src/app/
├── core/
│   ├── models/
│   │   ├── app.models.ts             # Actualizado con 'stockMaximo' en InventoryItem
│   │   └── inventario.model.ts       # Modelos del API de Inventario (snake_case)
│   │
│   └── services/
│       ├── inventario.service.ts     # Servicio ACTIVO (Mock reactivo con RxJS)
│       └── inventario.service.http.ts# Servicio DE RESPALDO (HTTP real para FastAPI)
│
└── features/
    ├── inventario/
    │   ├── inventario.component.ts   # Vista Principal (Smart) con Angular Signals
    │   ├── inventario.component.html # Vista Principal (Buscador, Tabla y Modal)
    │   ├── inventario.component.scss # Estilos responsivos y de atajos visuales
    │   └── components/
    │       └── inventario-config-modal/  # Diálogo de Configuración (Dumb Modal)
    │           ├── inventario-config-modal.component.ts
    │           ├── inventario-config-modal.component.html
    │           └── inventario-config-modal.component.scss
    │
    └── movimientos/
        └── movimientos.component.ts  # Refactored para pre-seleccionar mediante Query Params
```

---

## 3. Modelo de Datos (`snake_case` para Backend)

Diseñado para coincidir con la especificación `Pydantic` de FastAPI para inventarios.

### 3.1. `inventario.model.ts`
*   **`InventarioItem`**: Representa un ítem del almacén.
```typescript
export interface InventarioItem {
  id_producto: number;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo?: number | null;
  ultimo_movimiento: string;
}
```
*   **`InventarioConfigPayload`**: Payload para actualizar las alertas logísticas (`PUT /api/inventario/{id_producto}/configuracion`).
```typescript
export interface InventarioConfigPayload {
  stock_minimo: number;
  stock_maximo: number;
}
```

---

## 4. Guía de Integración con el Backend FastAPI Real

Cuando el backend real de inventarios esté operativo, **el desarrollador a cargo de la conexión solo deberá**:

1. Abrir `src/app/core/services/inventario.service.http.ts` y copiar todo su contenido.
2. Abrir `src/app/core/services/inventario.service.ts`, borrar todo y pegar el código copiado.
3. Renombrar la clase `InventarioHttpService` a `InventarioService`.

---

## 5. Lógica del Atajo de "Movimiento Rápido"

La comunicación SPA entre el catálogo de inventario y los formularios de transacciones se realiza de la siguiente manera:

1. **Emisión (Inventario)**: Al hacer clic en la opción `Reponer ➜` de la fila, el componente ejecuta:
   ```typescript
   this.router.navigate(['/movimientos'], { queryParams: { productoId: productId } });
   ```
2. **Recepción (Movimientos)**: En `MovimientosComponent.ngOnInit()`, nos suscribimos a los parámetros de la URL:
   ```typescript
   this.route.queryParams.subscribe(params => {
     const prodId = params['productoId'];
     if (prodId) {
       const idNum = Number(prodId);
       this.productoEntrada = idNum;
       this.productoSalida = idNum;
       this.productoAjuste = idNum;
       this.tabActiva = 'entrada'; // Abre por defecto la pestaña de reposición (Entradas)
     }
   });
   ```

---

## 6. Validación de Negocio Logístico en el Formulario

Para resguardar la integridad logística del almacén, el formulario modal `InventarioConfigModalComponent` posee un validador cruzado (`stockRangeValidator`) que valida en tiempo real la siguiente restricción de negocio:
$$\text{Stock Máximo} > \text{Stock Mínimo}$$

Si el operador intenta ingresar un stock máximo menor o igual al mínimo:
- El formulario se marca como inválido (`form.invalid = true`).
- Se bloquea el botón "Aplicar Configuración".
- Se despliega una caja de advertencia semántica (`.alert-box`) en color rojo informando al operador sobre la inconsistencia del rango.

---

## 7. Funcionalidad de Historial y Filtros Críticos Dinámicos

Para brindar una experiencia premium, hemos hecho completamente interactivos todos los elementos de la interfaz:
1. **Ver productos críticos (Botón Superior)**: Activa una señal reactiva (`soloCriticos`) que filtra la grilla al instante para mostrar únicamente aquellos productos que estén en estado `stock bajo` o `agotado`. El botón cambia su color e indicación dinámicamente.
2. **Registrar movimiento (Botón Superior)**: Redirige de inmediato al operador a la pestaña general de transacciones en `/movimientos`.
3. **Historial por producto (Botón en Grilla)**: Navega a `/movimientos` con la query param `accion=historial`. Esto filtra la grilla de "Movimientos Recientes" al vuelo para visualizar únicamente las transacciones del producto seleccionado, mostrando una caja informativa (`.filter-alert-banner`) azul con la opción de limpiar el filtro con un solo clic.

