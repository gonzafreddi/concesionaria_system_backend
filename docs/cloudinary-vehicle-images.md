# Cloudinary para imágenes de vehículos

## Qué se instaló

- `cloudinary` para subir y eliminar assets remotos.
- `multer` para recibir archivos `multipart/form-data`.
- `@types/multer` para tipado de archivos en NestJS.

## Variables de entorno necesarias

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## Arquitectura

- `src/cloudinary/cloudinary.module.ts`: módulo global reusable.
- `src/cloudinary/cloudinary.service.ts`: encapsula la configuración y las operaciones `upload`/`delete`.
- `src/vehicle-images/vehicle-images.module.ts`: módulo específico de imágenes de vehículos.
- `src/vehicle-images/vehicle-images.service.ts`: resuelve validaciones, orden, portada, eliminación y consistencia transaccional en base.
- `src/vehicle-images/vehicle-images.controller.ts`: expone endpoints HTTP sin lógica pesada.
- `src/vehicle-images/entities/vehicle-image.entity.ts`: entidad relacional que guarda metadata de Cloudinary.
- `src/vehicles/entities/vehicle.entity.ts`: agrega `OneToMany` con `images`.
- `src/vehicles/vehicles.service.ts`: devuelve imágenes ordenadas en consultas de vehículos.

## Modelo de datos

Tabla `vehicle_images`:

- `id`
- `url`
- `public_id`
- `is_cover`
- `order`
- `vehicle_id`
- `created_at`
- `updated_at`

Relaciones:

- Un `Vehicle` tiene muchas `VehicleImage`.
- Cada `VehicleImage` pertenece a un único `Vehicle`.
- Al consultar vehículo detalle se incluyen `images` ordenadas por `order ASC`.

## Endpoints agregados

### `POST /vehicles/:vehicleId/images`

Sube una o varias imágenes usando `multipart/form-data`.

Reglas:

- Campo esperado: `files`.
- Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`.
- Máximo por archivo: `5MB`.
- Las imágenes se suben a `concesionaria/vehicles/{vehicleId}`.
- Si el vehículo no tiene imágenes, la primera subida queda como portada.
- Las nuevas imágenes se agregan al final.

Ejemplo `curl`:

```bash
curl -X POST "http://localhost:3001/vehicles/12/images" \
  -H "Authorization: Bearer <token>" \
  -F "files=@/ruta/frente.jpg" \
  -F "files=@/ruta/lateral.webp"
```

Respuesta ejemplo:

```json
[
  {
    "id": 31,
    "url": "https://res.cloudinary.com/.../image/upload/v1710/concesionaria/vehicles/12/frente.jpg",
    "publicId": "concesionaria/vehicles/12/abc123",
    "isCover": true,
    "order": 1,
    "vehicleId": 12,
    "createdAt": "2026-04-23T11:00:00.000Z",
    "updatedAt": "2026-04-23T11:00:00.000Z"
  }
]
```

### `PATCH /vehicles/:vehicleId/images/:imageId/cover`

Marca una imagen como portada y desmarca el resto del mismo vehículo.

Ejemplo:

```bash
curl -X PATCH "http://localhost:3001/vehicles/12/images/31/cover" \
  -H "Authorization: Bearer <token>"
```

Respuesta ejemplo:

```json
{
  "id": 31,
  "url": "https://res.cloudinary.com/...",
  "publicId": "concesionaria/vehicles/12/abc123",
  "isCover": true,
  "order": 1,
  "vehicleId": 12,
  "createdAt": "2026-04-23T11:00:00.000Z",
  "updatedAt": "2026-04-23T11:05:00.000Z"
}
```

### `PATCH /vehicles/:vehicleId/images/reorder`

Reordena imágenes. El endpoint espera la lista completa de imágenes del vehículo para evitar inconsistencias.

Ejemplo:

```json
{
  "items": [
    { "imageId": 32, "order": 1 },
    { "imageId": 31, "order": 2 }
  ]
}
```

Respuesta ejemplo:

```json
[
  {
    "id": 32,
    "url": "https://res.cloudinary.com/...",
    "publicId": "concesionaria/vehicles/12/def456",
    "isCover": false,
    "order": 1,
    "vehicleId": 12,
    "createdAt": "2026-04-23T11:01:00.000Z",
    "updatedAt": "2026-04-23T11:10:00.000Z"
  },
  {
    "id": 31,
    "url": "https://res.cloudinary.com/...",
    "publicId": "concesionaria/vehicles/12/abc123",
    "isCover": true,
    "order": 2,
    "vehicleId": 12,
    "createdAt": "2026-04-23T11:00:00.000Z",
    "updatedAt": "2026-04-23T11:10:00.000Z"
  }
]
```

### `DELETE /vehicles/:vehicleId/images/:imageId`

Elimina primero en Cloudinary y luego en PostgreSQL.

Reglas:

- Si la imagen eliminada era portada, se reasigna automáticamente a la imagen restante con menor `order`.
- Después se normaliza el orden restante.

Ejemplo:

```bash
curl -X DELETE "http://localhost:3001/vehicles/12/images/31" \
  -H "Authorization: Bearer <token>"
```

Respuesta ejemplo:

```json
{
  "message": "Imagen eliminada correctamente"
}
```

## Flujo de subida

1. El backend valida que el vehículo exista.
2. Valida presencia de archivos, mime type y tamaño máximo.
3. Sube cada archivo a Cloudinary dentro de `concesionaria/vehicles/{vehicleId}`.
4. Guarda en PostgreSQL `url`, `publicId`, `isCover`, `order`, `vehicleId`.
5. Devuelve las imágenes creadas/actualizadas ordenadas.

## Flujo de eliminación

1. El backend valida que vehículo e imagen existan y estén relacionados.
2. Elimina la imagen en Cloudinary usando `publicId`.
3. Borra el registro en `vehicle_images`.
4. Reasigna portada si hacía falta.
5. Recalcula `order` en forma secuencial.

## Consultas de vehículos

- `GET /vehicles`
- `GET /vehicles/:id`

Ahora incluyen `images` ordenadas por `order ASC`.

## Cómo probar desde Swagger o Postman

- Activar Swagger con `ENABLE_SWAGGER=true`.
- Ir a `http://localhost:3001/api/docs`.
- Autenticarse si el entorno exige JWT.
- Probar `POST /vehicles/:vehicleId/images` usando `multipart/form-data` y el campo `files`.
- Verificar las demás operaciones con los IDs devueltos.

## Consideraciones para frontend Next.js

- Enviar imágenes como `FormData` usando el campo `files`.
- Usar el `id` de la imagen para portada, reorder y delete.
- Usar `url` para preview y render de galería.
- Usar `isCover` para destacar la portada.
- Mantener el orden en estado local y enviar el array completo al endpoint de reorder.

## Testing manual sugerido

1. Crear o identificar un vehículo existente en PostgreSQL.
2. Subir una o más imágenes al vehículo.
3. Confirmar en Cloudinary que quedaron en `concesionaria/vehicles/{vehicleId}`.
4. Confirmar en PostgreSQL que se guardaron `url`, `public_id`, `is_cover`, `order`.
5. Consultar `GET /vehicles/:id` y verificar que `images` llegue ordenado.
6. Marcar otra imagen como portada y validar que sólo una quede con `isCover=true`.
7. Reordenar enviando el array completo y verificar persistencia.
8. Eliminar una imagen y confirmar que desaparece en Cloudinary y en `vehicle_images`.
9. Si eliminaste la portada, verificar que otra imagen haya quedado como portada.
