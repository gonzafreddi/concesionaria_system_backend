# Integracion frontend de imagenes de vehiculos

## Estado

La implementacion de backend para imagenes de vehiculos quedo lista para integrar en el frontend.

Ya estan resueltos:

- Subida multiple de imagenes por `multipart/form-data`.
- Persistencia en Cloudinary.
- Persistencia de metadata en PostgreSQL.
- Seleccion de portada.
- Reordenamiento manual.
- Eliminacion de imagenes.
- Inclusion de `images` en `GET /vehicles` y `GET /vehicles/:id`.

## Prerrequisitos

Antes de integrar en frontend, verificar:

- Variables de entorno de Cloudinary configuradas:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

- Migracion `migrations/20260423_vehicle_images_cloudinary.sql` aplicada.
- El frontend envia token si el entorno tiene autenticacion habilitada.

## Contrato para frontend

### 1. Subir imagenes

`POST /vehicles/:vehicleId/images`

Formato:

- `Content-Type`: `multipart/form-data`
- Campo esperado: `files`
- Maximo: `10` archivos por request
- Tamano maximo por archivo: `5MB`
- Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`

Ejemplo con `fetch`:

```ts
const formData = new FormData();

for (const file of selectedFiles) {
  formData.append('files', file);
}

const response = await fetch(`${API_URL}/vehicles/${vehicleId}/images`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const images = await response.json();
```

Respuesta:

```ts
type VehicleImage = {
  id: number;
  url: string;
  publicId: string;
  isCover: boolean;
  order: number;
  vehicleId: number;
  createdAt: string;
  updatedAt: string;
};
```

Notas:

- Si el vehiculo no tenia imagenes, la primera queda con `isCover: true`.
- Las nuevas imagenes se agregan al final segun `order`.

### 2. Marcar portada

`PATCH /vehicles/:vehicleId/images/:imageId/cover`

No requiere body.

Ejemplo:

```ts
await fetch(`${API_URL}/vehicles/${vehicleId}/images/${imageId}/cover`, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### 3. Reordenar

`PATCH /vehicles/:vehicleId/images/reorder`

Body:

```json
{
  "items": [
    { "imageId": 32, "order": 1 },
    { "imageId": 31, "order": 2 }
  ]
}
```

Importante:

- Hay que enviar el listado completo de imagenes del vehiculo.
- No alcanza con enviar solo las que cambiaron.
- El backend normaliza el orden final a `1..n`.

### 4. Eliminar

`DELETE /vehicles/:vehicleId/images/:imageId`

Si se elimina la portada, el backend asigna automaticamente una nueva.

## Lectura desde frontend

Los endpoints:

- `GET /vehicles`
- `GET /vehicles/:id`

devuelven la propiedad `images` ya ordenada por `order ASC`.

Sugerencia de uso en UI:

- Renderizar preview con `url`.
- Marcar visualmente la portada usando `isCover`.
- Usar `id` como clave estable en drag and drop.
- Mantener el orden local y persistirlo con el endpoint de reorder.

## Errores esperables

Casos que el frontend deberia manejar:

- `400` si no se envian archivos.
- `400` si el mime type no es valido.
- `400` si un archivo supera `5MB`.
- `400` si el reorder no contiene todas las imagenes o trae IDs duplicados.
- `404` si el vehiculo no existe.
- `404` si la imagen no pertenece al vehiculo.
- `500` si Cloudinary no esta configurado o falla la subida/eliminacion remota.

## Recomendaciones no bloqueantes

No hace falta agregar nada mas para empezar la integracion del front. Como mejoras futuras, pero no bloqueantes:

- Agregar tests automatizados para `vehicle-images`.
- Agregar compresion o resize previo si el frontend va a subir imagenes pesadas desde mobile.
- Definir limite funcional total de imagenes por vehiculo si negocio lo necesita.
- Mostrar mensajes de error amigables para validaciones de tamano y formato.

## Archivos backend involucrados

- `src/cloudinary/cloudinary.service.ts`
- `src/vehicle-images/vehicle-images.controller.ts`
- `src/vehicle-images/vehicle-images.service.ts`
- `src/vehicle-images/entities/vehicle-image.entity.ts`
- `src/vehicles/vehicles.service.ts`
- `migrations/20260423_vehicle_images_cloudinary.sql`
- `docs/cloudinary-vehicle-images.md`
