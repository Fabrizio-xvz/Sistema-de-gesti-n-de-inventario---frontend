# Documentación Técnica: Módulo de Autenticación y Login 
## Proyecto: JUDO Frontend (Gestión Logística e Inventario)

Esta documentación describe la arquitectura, la lógica de seguridad y el diseño visual premium del módulo de autenticación implementado en el frontend de **JUDO** utilizando **Angular v21 (Standalone Components, Signals e Inyección Funcional)**.

---

## 1. Arquitectura del Sistema de Autenticación

El sistema de seguridad está diseñado de forma modular y descentralizada bajo la carpeta `core/` y `features/auth/`, comunicándose a través del siguiente flujo de dependencias:

```mermaid
graph TD
    A[Usuario] -->|Interactúa| B[LoginComponent]
    B -->|Invoca login()| C[AuthService]
    C -->|Petición POST url-encoded| D[API FastAPI]
    D -->|Retorna JWT Token| C
    C -->|Decodifica JWT y guarda sesión| E[Storage: Local/Session]
    
    F[HTTP Requests] -->|Pasan por| G[AuthInterceptor]
    G -->|Inyecta Authorization Header| D
    D -->|Si expira retorna 401| G
    G -->|Redirige en caliente| B
    
    H[Navegación de Rutas] -->|Evaluada por| I[AuthGuard]
    I -->|Verifica isAuthenticated()| H
```

---

## 2. Componentes del Núcleo de Seguridad (Core)

### A. Servicio Central de Autenticación (auth.service.ts)
Es el motor del flujo de seguridad. Mantiene el estado reactivo del usuario usando señales de Angular (`signal` y `computed`).

* **Petición Compatible con OAuth2:** Envía las credenciales usando `HttpParams` con el formato `application/x-www-form-urlencoded`, convirtiendo `correo` a la clave `username` requerida por los estándares de FastAPI.
* **Persistencia Híbrida Inteligente:** 
  * Si la casilla **"Recordar sesión"** está activada, guarda el token en `localStorage` (sesión indefinida).
  * Si está desactivada, lo guarda en `sessionStorage` (el token se destruye al cerrar la pestaña).
* **Decodificación Nativa de JWT:** Extrae y decodifica el payload JWT usando funciones nativas de JavaScript (`atob`) sin añadir peso a la aplicación mediante librerías de terceros.
* **Evaluación de Expiración en Caliente:** La señal computada `isAuthenticated` evalúa en tiempo real si el token existe y si la fecha de expiración `exp` del payload aún es válida.
* **Bypass de Desarrollo Offline (Crucial):** Si la API no responde (servidor apagado o scaffold), simula el login interactivo y la autenticación detallada con las credenciales **`julia@judo.pe`** y **`123456`**.

### B. Interceptor de Cabeceras (auth.interceptor.ts)
Un interceptor HTTP funcional que actúa como aduana para las llamadas al servidor:
1. **Inyección del Token:** Agrega de forma automática la cabecera `Authorization: Bearer <token>` a toda petición saliente si el usuario cuenta con sesión activa.
2. **Controlador del Error 401 (Sesión Caducada):** Captura respuestas de error del servidor con estatus `401 Unauthorized`, gatillando una limpieza de credenciales y redireccionando al usuario al `/login` de inmediato.

### C. Guarda de Rutas (auth.guard.ts)
Una guarda funcional basada en la señal reactiva `isAuthenticated()`. Protege de forma jerárquica toda la rama administrativa y vistas del dashboard, impidiendo la navegación no autorizada y forzando la redirección al login.

---

## 3. Interfaz de Usuario y Experiencia Visual Premium (login.component)

La vista de inicio de sesión ha sido optimizada estéticamente bajo estándares SaaS internacionales:

### A. Elementos de Diseño Premium
* **Glassmorphism (Tarjeta de Cristal):** La tarjeta de login utiliza un fondo blanco traslúcido con alta saturación, un borde blanco brillante ultrafino y un desenfoque de fondo dinámico (`backdrop-filter: blur(20px)` y `background: rgba(255, 255, 255, 0.85)`), integrándose orgánicamente al entorno.
* **Orbes de Luz Flotantes Animados:** Dos blobs gigantes con gradientes radiales de color azul y cerceta flotan lentamente en el fondo de la pantalla mediante fotogramas clave (`@keyframes`), otorgando movimiento suave y premium a la vista.
* **Tipografía y Logotipo:** El título `JUDO` está formateado con la tipografía de alto impacto `Outfit` con gradientes de azul oscuro a azul corporativo, mientras que el contenedor del isotipo (`🏪`) cuenta con una sombra de luz azul neón suave.

### B. Sistema de Validaciones Interactiva Campo por Campo
* **Feedback de Errores Visual:** Si un campo es obligatorio o tiene un formato incorrecto (ej: correo sin `@`), al hacer clic fuera del input se pintará un **borde rojo suave**, un **fondo rosado tenue** y un **halo de brillo rojo** gracias a la clase `.ng-invalid.ng-touched` de Angular.
* **Textos de Ayuda Dinámicos:** Muestra mensajes en fuente pequeña y negrita roja exactamente debajo del campo que falló.
* **Borrado de Alertas en Caliente:** Gracias a la directiva `(ngModelChange)="onInputChange()"` vinculada a ambos campos, el banner de alerta rojo de la parte superior **desaparece de inmediato en cuanto el usuario presiona cualquier tecla** para corregir sus datos.

### C. Alternador de Visibilidad de Contraseña Vectorial (Show Password)
* En lugar de emojis del sistema (que varían su diseño según el sistema operativo), se integró un botón con **iconos vectoriales puros SVG** (`Heroicons`).
* Muestra el icono `Ojo` para revelar la clave y `Ojo tachado` para ocultarla.
* **Accesibilidad Optimizada:** Cuenta con la propiedad `tabindex="-1"`. Esto evita que la tecla **Tab** enfoque el icono del ojo, permitiendo saltar directamente del input de contraseña al botón "Ingresar", mejorando la ergonomía de navegación por teclado.

---

## 4. Matriz de Comportamiento de Errores (Bypass Local)

Para facilitar las pruebas visuales y de flujo del cliente sin depender de la base de datos del backend, se programaron respuestas personalizadas muy detalladas:

| Correo | Contraseña | Comportamiento del Formulario | Banner de Error |
| :--- | :--- | :--- | :--- |
| **Vacío** | *Cualquiera* | Botón de envío deshabilitado. | Ninguno (Bloqueado) |
| `invalido-sin-arroba` | *Cualquiera* | Entrada pintada de rojo (touched). | *"Ingresa un formato de correo válido."* |
| `incorrecto@judo.pe` | `123456` | Envío denegado localmente. | *"El correo ingresado es incorrecto."* |
| `julia@judo.pe` | `clave_invalida` | Envío denegado localmente. | *"La contraseña ingresada es incorrecta."* |
| `incorrecto@judo.pe` | `clave_invalida` | Envío denegado localmente. | *"El correo y la contraseña ingresados son incorrectos."* |
| `julia@judo.pe` | `123456` | Envío aprobado. Guarda JWT. | Ninguno (Redirección al Dashboard) |

---

## 5. Integración Global en el Proyecto

### Configuración del App Config (app.config.ts)
Se inyectó el cliente HTTP funcional junto con nuestro interceptor de seguridad personalizado:
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])), // Interceptor registrado
  ],
};
```

### Configuración de Rutas de Seguridad (app.routes.ts)
Se protegió todo el bloque de administración del dashboard aplicando `authGuard` al nodo padre:
```typescript
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard], // Guarda de protección activa
    loadComponent: () =>
      import('./core/layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: ... },
      { path: 'inventario', loadComponent: ... },
      { path: 'productos', loadComponent: ... },
      { path: 'categorias', loadComponent: ... },
      // ...
    ]
  }
];
```
