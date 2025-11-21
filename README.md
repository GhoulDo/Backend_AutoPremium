# AutoPremium Backend

Backend en Node.js + Express para la gestión de un concesionario de autos de lujo. Incluye autenticación con roles de cliente y administrador, gestión de vehículos y conexión a PostgreSQL.

## Requisitos

- Node.js 18+
- PostgreSQL 14+

## Instalación

```bash
npm install
```

Configura un archivo `.env` con las variables necesarias:

```env
PORT=4000
DATABASE_URL=postgresql://autopremium_db_user:HuZkyQHGFiGl7SzbK4gducbBdZ6zzzSW@dpg-d4g1kcngi27c73b6ota0-a.virginia-postgres.render.com/autopremium_db
JWT_SECRET=supersecreto_seguro
DB_SSL=true
DEFAULT_ADMIN_EMAIL=admin@autopremium.com
DEFAULT_ADMIN_PASSWORD=Admin123*
```

## Scripts

- `npm run dev`: Inicia el servidor con nodemon.
- `npm start`: Inicia el servidor en modo producción.

## Documentación de la API

Todas las respuestas son JSON. Los endpoints protegidos requieren `Authorization: Bearer <token>`.

### Autenticación

**POST `/api/auth/register`** — Crea un cliente o administrador.

Body de ejemplo:
```json
{
  "firstName": "Ana",
  "lastName": "López",
  "email": "ana@cliente.com",
  "password": "Clave123*",
  "role": "cliente",
  "phone": "+57-30000000"
}
```

Respuesta 201:
```json
{
  "token": "<jwt>",
  "user": {
    "id": "uuid",
    "firstName": "Ana",
    "lastName": "López",
    "email": "ana@cliente.com",
    "role": "cliente"
  }
}
```

**POST `/api/auth/login`** — Devuelve token JWT.

```json
{
  "email": "ana@cliente.com",
  "password": "Clave123*"
}
```

### Vehículos

**GET `/api/vehicles`** — Público. Lista vehículos ordenados por fecha de creación.

**POST `/api/vehicles`** — Rol `administrador`.

```json
{
  "brand": "Ferrari",
  "model": "SF90 Stradale",
  "year": 2024,
  "price": 1275000.0,
  "imagePath": "/images/ferrari-sf90.jpg",
  "description": "Híbrido V8 986 hp",
  "status": "disponible"
}
```

**PATCH `/api/vehicles/:id`** — Rol `administrador`. Body parcial permitiendo actualizaciones puntuales.

```json
{
  "price": 1250000.0,
  "status": "reservado"
}
```

**DELETE `/api/vehicles/:id`** — Rol `administrador`.

### Usuarios

**GET `/api/users/me`** — Perfil del usuario autenticado.

Respuesta ejemplo:
```json
{
  "user": {
    "id": "uuid",
    "first_name": "Ana",
    "last_name": "López",
    "email": "ana@cliente.com",
    "role": "cliente",
    "phone": "+57-30000000",
    "created_at": "2025-01-10T12:00:00.000Z"
  }
}
```

**GET `/api/users`** — Rol `administrador`. Lista usuarios.

**PATCH `/api/users/:userId/role`** — Rol `administrador`.

```json
{
  "role": "administrador"
}
```

### Citas (Test Drives)

**POST `/api/appointments`** — Usuario autenticado. Verifica disponibilidad y evita conflictos.

```json
{
  "vehicleId": "uuid-vehiculo",
  "scheduledAt": "2025-01-12T15:00:00Z",
  "notes": "Prefiero turno tarde"
}
```

**GET `/api/appointments/me`** — Citas del usuario.

**GET `/api/appointments`** — Rol `administrador`. Incluye datos de usuario y vehículo.

**PATCH `/api/appointments/:id/status`** — Rol `administrador`.

```json
{
  "status": "confirmada"
}
```

- `confirmada` reserva el vehículo automáticamente.
- `cancelada` o `realizada` liberan el vehículo (status `disponible`).

## SQL de la base de datos

Consulta el archivo `db/schema.sql` para el script de creación de la base de datos PostgreSQL.

## Conexión con Render

1. **Configura las variables de entorno** en tu servicio backend (Render, Docker o local) con la `DATABASE_URL` proporcionada por Render y `DB_SSL=true`.
2. **Permite tu IP** en Render > Database > Inbound rules si ejecutarás migraciones desde tu máquina.
3. Inicializa la base remota ejecutando:

```bash
PGPASSWORD=HuZkyQHGFiGl7SzbK4gducbBdZ6zzzSW \
psql -h dpg-d4g1kcngi27c73b6ota0-a.virginia-postgres.render.com \
    -U autopremium_db_user autopremium_db \
    -f db/schema.sql
```

4. Verifica/crea datos base (admin + vehículos demo) con:

```bash
npm run seed
```

> El backend ejecuta este mismo proceso automáticamente al iniciar (`bootstrapData`) para asegurar que exista un administrador y vehículos cuando la tabla esté vacía.

## Guía para el Frontend Móvil

Esta sección resume cómo un cliente móvil (iOS/Android con React Native, Flutter, etc.) puede interactuar con la API.

### Flujo de Autenticación

1. Registrar usuario (`POST /api/auth/register`) si aún no existe.
2. Iniciar sesión (`POST /api/auth/login`) y almacenar el `token` JWT de manera segura.
3. Incluir el header `Authorization` en cada petición protegida:

```
Authorization: Bearer <token>
```

4. Renovar sesión solicitando un nuevo token cuando expire (la API devuelve 401 si el token es inválido o expiró).

### Módulos Sugeridos

- **Inicio/Splash**: Verificar si existe token almacenado y su validez.
- **Catálogo**: Consumir `GET /api/vehicles`, permitir filtros por marca/estado y mostrar imágenes usando la ruta `image_path` (ej. cargar desde CDN/backend estático).
- **Detalle de Vehículo**: Mostrar datos completos, botones para agendar test drive o contactar.
- **Agenda**: Formulario que consume `POST /api/appointments` con selector de fecha/hora (validar horario futuro antes de enviar).
- **Mis Citas**: Listado usando `GET /api/appointments/me`, mostrar estado actual y permitir cancelación si decides exponerlo.
- **Perfil**: `GET /api/users/me`, permitir actualización de datos personales si se habilita endpoint futuro.
- **Panel Admin (opcional)**: Para usuarios `administrador`, habilitar agregar/editar vehículos (`POST/PATCH /api/vehicles`) y administrar citas (`GET /api/appointments`, `PATCH /api/appointments/:id/status`).

### Manejo de Estados

- **Estados de vehículo**: `disponible`, `reservado`, `vendido`, `mantenimiento`. Usar estos valores para etiquetas/colores en UI y determinar acciones disponibles.
- **Estados de cita**: `pendiente`, `confirmada`, `cancelada`, `realizada`. Ajustar flujo visual (por ejemplo, badge verde para confirmada, rojo para cancelada).

### Errores y Mensajes

- La API regresa mensajes descriptivos en `error`. Mostrar al usuario en notificaciones/modales.
- Validar datos en el cliente siguiendo las mismas reglas (ej. años entre 1950 y año actual +1, precios >= 0, fecha futura para citas) para UX más ágil.

### Seguridad

- Guardar el token en almacenamiento seguro (SecureStore en Expo, Keychain/Keystore nativos).
- Cerrar sesión eliminando token y limpiando estado global.
- Considerar refrescar listados tras acciones (por ejemplo, al confirmar/cancelar una cita refrescar `GET` correspondiente).

### Pantallas Recomendadas

| Pantalla | Objetivo | Acciones clave |
| --- | --- | --- |
| Splash / Loading | Verificar sesión y conectividad | Revisar token almacenado, precargar catálogo si es posible |
| Onboarding | Presentar marca y beneficios | Slides con CTA a registro/login |
| Login / Registro | Autenticar usuarios | Enviar credenciales, manejar errores, recordar usuario |
| Home / Catálogo | Explorar autos | Mostrar lista/galería con filtros, navegación al detalle |
| Detalle del Vehículo | Información completa | Mostrar specs, disponibilidad, botón agendar |
| Agenda Test Drive | Programar cita | Seleccionar fecha/hora futura, enviar notas |
| Mis Citas | Seguimiento personal | Ver estados, cancelar cita pendiente |
| Perfil | Datos del usuario | Mostrar/editar datos, cerrar sesión |
| Panel Admin | Gestión avanzada | CRUD vehículos, gestionar usuarios y citas, ver métricas |
| Error / Offline | Manejo de fallas | Permitir reintentar, mostrar mensajes claros |

### Consideraciones UI/UX Adicionales

- Paleta premium (negro, dorado, blanco) con contrastes adecuados.
- Tipografía elegante y consistente con la marca.
- Animaciones sutiles (transiciones entre autos, feedback al agendar).
- Badges/etiquetas para estados de vehículo y cita.
- Modo oscuro opcional para reforzar el estilo de lujo.
- Preparar internacionalización (es/en) y soporte RTL si se expande el mercado.

### Endpoints Útiles Resumidos

- Público: `GET /api/vehicles`
- Autenticados: `GET /api/users/me`, `POST /api/appointments`, `GET /api/appointments/me`
- Administrador: `POST/PATCH/DELETE /api/vehicles`, `GET /api/users`, `PATCH /api/users/:userId/role`, `GET /api/appointments`, `PATCH /api/appointments/:id/status`

Con esta guía, el equipo móvil puede estructurar pantallas, manejar estados y conectar servicios al backend AutoPremium.

## Documentación extendida

Consulta `docs/API.md` para ejemplos completos de peticiones/respuestas, variables de entorno y recomendaciones adicionales para el equipo móvil y QA.
