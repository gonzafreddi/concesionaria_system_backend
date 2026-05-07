import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private isConfigured = false;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn(
        'Cloudinary no configurado. Definí CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET para habilitar la subida de imágenes.',
      );
      return;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    this.isConfigured = true;
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadApiResponse> {
    this.ensureConfigured();

    try {
      return await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) {
              this.logger.error(
                `Cloudinary upload failed for folder ${folder}: ${this.formatCloudinaryError(error)}`,
              );
              reject(
                new InternalServerErrorException(
                  'No se pudo subir la imagen a Cloudinary',
                ),
              );
              return;
            }

            resolve(result);
          },
        );

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al subir la imagen a Cloudinary',
      );
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    this.ensureConfigured();

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      });

      if (result.result !== 'ok' && result.result !== 'not found') {
        this.logger.error(
          `Cloudinary delete failed for publicId ${publicId}: ${JSON.stringify(result)}`,
        );
        throw new InternalServerErrorException(
          'No se pudo eliminar la imagen de Cloudinary',
        );
      }
    } catch (error) {
      this.logger.error(
        `Unexpected Cloudinary delete error for publicId ${publicId}: ${this.formatCloudinaryError(error)}`,
      );

      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al eliminar la imagen de Cloudinary',
      );
    }
  }

  private formatCloudinaryError(error: unknown): string {
    if (!error) {
      return 'unknown error';
    }

    if (error instanceof Error) {
      return error.stack || error.message;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  private ensureConfigured(): void {
    if (!this.isConfigured) {
      throw new InternalServerErrorException(
        'Cloudinary no está configurado en el entorno actual',
      );
    }
  }
}
