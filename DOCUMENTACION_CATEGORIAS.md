# Documentación Técnica: Módulo de Categorías

Esta documentación detalla la arquitectura, el diseño de la interfaz de usuario y la lógica de integración del **Módulo de Categorías**, construido en Angular utilizando las últimas características del framework (Signals, Standalone Components).

---

## 1. Descripción General

El Módulo de Categorías permite visualizar, buscar, crear, editar y desactivar (inactivar) rápidamente las categorías que organizan el inventario. Actualmente, el módulo está implementado como una **maqueta funcional completa (Mock)**, lo que permite realizar pruebas interactivas de UI sin necesidad de conectar con el backend.

---

## 2. Estructura de Directorios

El código sigue un patrón arquitectónico limpio (Smart/Dumb Components) para facilitar su escalabilidad:

```text
src/app/
├── core/
│   ├── models/
│   │   └── categoria.model.ts        # Interfaces y tipos de datos (Payloads)
│   └── services/
│       ├── categoria.service.ts      # Servicio ACTIVO (Mock Data con RxJS)
│       └── categoria.service.http.ts # Servicio DE RESPALDO (HTTP Real para FastAPI)
│
└── features/
    └── categorias/
        ├── categorias.component.ts   # Componente Principal (Smart) con Signals
        ├── categorias.component.html # Vista Principal (Grilla y Buscador)
        ├── categorias.component.scss
        └── components/
            └── categoria-form-modal/ # Modal de Formulario (Crear/Editar)
                ├── categoria-form-modal.component.ts
                ├── categoria-form-modal.component.html
                └── categoria-form-modal.component.scss
```

---

## 3. Modelos de Datos (`categoria.model.ts`)

Los modelos están diseñados para mapear exactamente con la especificación `OpenAPI` de FastAPI:

*   **`Categoria`**: Modelo principal con campos `id_categoria`, `nombre_categoria`, `descripcion`, y `activo`.
*   **`CategoriaPayload`**: DTO (Data Transfer Object) utilizado para enviar datos al crear (`POST`) o actualizar (`PUT`).
*   **`InactivarPayload`**: Objeto para el método `PATCH` que exige el backend, el cual contiene un `motivo`.

---

## 4. Estado de Conexión (Mock vs Backend Real)

Actualmente, el módulo usa datos simulados. Se implementó usando observadores (`Observables`) de `RxJS` y la función `delay()` para imitar con exactitud el comportamiento asíncrono de internet (tiempos de carga).

> **Instrucciones para conectar al Backend Real:**
> Cuando el servidor FastAPI esté listo para integrarse, el desarrollador a cargo solo deberá hacer lo siguiente:
> 1. Abrir `src/app/core/services/categoria.service.http.ts`.
> 2. Copiar todo el contenido de la clase.
> 3. Pegarlo y reemplazar la clase dentro de `src/app/core/services/categoria.service.ts`.
> 
> *Nota: Ningún archivo HTML, ni componente (TS) necesita ser modificado. La UI detectará automáticamente el cambio.*

---

## 5. Arquitectura de UI y Componentes

### 5.1. `CategoriasComponent` (Smart Component)
Es el contenedor principal de la vista. Se encarga de:
*   **Gestión de Estado Reactivo:** Utiliza `signal` (`categorias`, `busqueda`) para evitar dependencias innecesarias y mejorar el rendimiento de Angular.
*   **Búsqueda Instantánea:** A través de un `computed()`, la lista de tarjetas se filtra en tiempo real en la memoria sin disparar peticiones al servidor al escribir en el buscador.
*   **Inactivación Rápida:** Implementa la lógica para que al darle al botón "Desactivar" de una tarjeta, se envíe el motivo *"Desactivación manual"* directo al servicio, actualizando el badge a "inactivo" sin recargar la página.

### 5.2. `CategoriaFormModalComponent` (Dumb Component)
Se encarga de la captura de datos (CRUD).
*   **Elemento HTML5 Nativo:** Construido sobre la etiqueta `<dialog>`, lo cual lo hace altamente eficiente (sin librerías pesadas como Angular Material Dialog).
*   **Reactive Forms:** Usa `FormGroup` con validaciones robustas:
    *   *Nombre:* Requerido y con un mínimo de 3 caracteres.
    *   *Descripción:* Opcional.
    *   *Activo:* Checkbox / Switch para definir estado de visibilidad.
*   **Estética Premium:** Usa animación de entrada en desvanecimiento (`fade-in`), efecto de cristal en el fondo (`backdrop-filter: blur`), enfoques iluminados en los inputs, y sombras para la elevación del modal.

---

## 6. Flujo de Usuario (Resumen Interactivo)

1.  **Listado:** El usuario ingresa a `/categorias`. El servicio dispara la carga y los presenta en tarjetas responsivas con iconos.
2.  **Filtrar:** El usuario escribe en la barra de búsqueda y los resultados cambian de forma fluida.
3.  **Añadir / Editar:** El usuario hace clic en el botón correspondiente. Se invoca la función `open()` del modal.
4.  **Guardar:** Si las validaciones del formulario están correctas, se dispara el evento `@Output() save`. El contenedor recibe el evento, llama al servicio (`POST` o `PUT`), espera el tiempo simulado, actualiza el `signal` de la lista, y cierra el modal automáticamente.
