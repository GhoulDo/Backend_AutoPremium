# Documentación AutoPremium API

## Despliegues

- **Producción**: `https://autopremium-backend.onrender.com`
- **Local**: `http://localhost:4000`

Todas las rutas expuestas se sirven bajo `/api/*`. Usa el header `Authorization: Bearer <token>` para los endpoints protegidos.

---

## Autenticación

### Registro
`POST /api/auth/register`

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

Respuesta: `201 Created`

```json
{
  "token": "jwt",
  "user": {
    "id": "uuid",
    "firstName": "Ana",
    "lastName": "López",
    "email": "ana@cliente.com",
    "role": "cliente"
  }
}
```

### Login
`POST /api/auth/login`

```json
{
  "email": "ana@cliente.com",
  "password": "Clave123*"
}
```

Respuesta: `200 OK` (igual formato que registro).

---

## Vehículos

| Método | Ruta | Autenticación | Descripción |
| --- | --- | --- | --- |
| GET | `/api/vehicles` | Pública | Listado completo ordenado por `created_at DESC`. |
| GET | `/api/vehicles/:id` | Pública | Datos completos de un vehículo. |
| POST | `/api/vehicles` | Admin | Crea un vehículo. Campos obligatorios: `brand`, `model`, `year`, `price`, `imagePath`. |
| PATCH | `/api/vehicles/:id` | Admin | Actualiza campos parciales. |
| DELETE | `/api/vehicles/:id` | Admin | Elimina un vehículo. |

Ejemplo `POST`:

```json
{
  "brand": "Ferrari",
  "model": "Roma Spider",
  "year": 2024,
  "price": 345000,
  "imagePath": "https://cdn.autopremium.com/ferrari-roma.jpg",
  "description": "V8 biturbo 612 hp",
  "status": "disponible"
}
```

---

## Usuarios

- `GET /api/users/me` (autenticado): Perfil del token actual.
- `GET /api/users` (admin): Lista con `id`, `nombre`, `correo`, `rol`, `phone`, `created_at`.
- `PATCH /api/users/:userId/role` (admin): Cambia el rol (`cliente` ↔ `administrador`).

Body:
```json
{ "role": "administrador" }
```

---

## Citas de prueba (Test Drives)

| Método | Ruta | Autenticación | Descripción |
| --- | --- | --- | --- |
| POST | `/api/appointments` | Cliente | Agenda una cita (el vehículo debe estar `disponible`). |
| GET | `/api/appointments/me` | Cliente | Historial del usuario actual. |
| GET | `/api/appointments` | Admin | Todas las citas con datos de usuario y vehículo. |
| PATCH | `/api/appointments/:id/status` | Admin | Actualiza el estado (`pendiente`, `confirmada`, `cancelada`, `realizada`). |

Body creación:

```json
{
  "vehicleId": "uuid",
  "scheduledAt": "2025-01-12T15:00:00Z",
  "notes": "Prefiero turno tarde"
}
```

Restricciones:
- La cita debe ser a futuro.
- No se permiten traslapamientos ±1 hora ni para el vehículo ni para el mismo usuario.
- Al confirmar se reserva el vehículo; al cancelar/realizar vuelve a `disponible`.

---

## Healthcheck
`GET /api/health` → `{ "status": "ok", "message": "AutoPremium API funcionando" }`

---

## Errores

El backend responde con:

```json
{ "error": "mensaje descriptivo" }
```

Códigos frecuentes:

- `400`: validación fallida.
- `401`: token ausente/incorrecto.
- `403`: rol insuficiente.
- `404`: recurso no existe.
- `409`: conflicto (email duplicado, horario ocupado).
- `500`: error inesperado.

---

## Variables de entorno relevantes

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto local (Render ignora y asigna el suyo). |
| `DATABASE_URL` | URL completa de PostgreSQL (Render interna/externa). |
| `DB_SSL` | `true` para Render, `false` local. |
| `JWT_SECRET` | Clave privada para firmar tokens. |
| `DEFAULT_ADMIN_EMAIL` | Correo del admin bootstrap. |
| `DEFAULT_ADMIN_PASSWORD` | Contraseña inicial (cámbiala después). |

---

## Guía rápida para el equipo móvil

1. **Auth Flow**: Login → guardar JWT en almacenamiento seguro → refrescar cuando expire (12h).
2. **Catálogo**: usar `GET /api/vehicles`; mostrar `status` con badges (disponible, reservado, vendido, mantenimiento).
3. **Detalle**: `image_path` ya es URL completa; manejar fallback cuando falle la carga.
4. **Agendar prueba**: formulario → `POST /api/appointments`. Validar fecha localmente antes de enviar.
5. **Mis citas**: `GET /api/appointments/me`, agrupar por estado y mostrar acciones (cancelar cuando haya endpoint).
6. **Panel admin**: proteger rutas según `role`. Mostrar métricas básicas (count de vehículos/citas) usando las respuestas actuales.
7. **Errores**: siempre mostrar `response.data.error` al usuario; para validaciones 400, indicar campos faltantes.
8. **Offline/cache**: cachear catálogo en local storage para un inicio rápido; invalidar cuando haya un refresh manual o push.

---

## Próximos pasos sugeridos

- Generar un archivo OpenAPI (`docs/openapi.yaml`) y montar Swagger UI.
- Agregar endpoints para cancelar cita por el usuario y cambiar contraseña.
- Implementar refresh tokens y políticas de password más estrictas.

