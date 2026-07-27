# Tarea: almacenar documentos PDF en Cloudinary

## Contexto

Para la salida inicial, los PDFs se guardan en PostgreSQL en
`generated_documents.file_data`. El proyecto ya dispone de
`CloudinaryService.uploadRawFile()` y `deleteRawFile()`, pero el módulo de
documentos todavía no los utiliza.

## Objetivo

Mover el contenido binario de los PDFs a Cloudinary y conservar en PostgreSQL
solamente la metadata, la URL segura y el `public_id`.

## Alcance

- Importar `CloudinaryModule` en `DocumentsModule`.
- Inyectar `CloudinaryService` en `GeneratedDocumentsService`.
- Subir cada PDF con `uploadRawFile()` dentro de una carpeta estable, por
  ejemplo `concesionaria/documents/{relatedEntityType}/{relatedEntityId}`.
- Guardar `secure_url` en `file_url` y `public_id` en `file_public_id`.
- Hacer nullable o eliminar `file_data` mediante una migración posterior a la
  transición.
- Descargar o redirigir el archivo desde Cloudinary en `GET /documents/:id/file`.
- Eliminar el recurso de Cloudinary antes de borrar el registro.
- Si falla el guardado en PostgreSQL después de subir el archivo, eliminar el
  recurso subido para evitar archivos huérfanos.
- Definir una estrategia para migrar los PDFs existentes desde PostgreSQL.
- Agregar pruebas para subida, rollback, descarga y eliminación.

## Criterios de aceptación

- Ningún PDF nuevo queda almacenado como `bytea`.
- La API mantiene los endpoints y respuestas actuales para no romper el frontend.
- Una falla parcial no deja registros ni archivos huérfanos.
- El borrado elimina el PDF remoto y su metadata.
- Las credenciales de Cloudinary se validan al iniciar producción.
- La migración de documentos existentes puede ejecutarse de forma repetible.

## Fuera de alcance

- Generación de PDFs en el backend.
- Firma digital y versionado de documentos.
- Cambio del proveedor de almacenamiento a S3 u otro servicio.
