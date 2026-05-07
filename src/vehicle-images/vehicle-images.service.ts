import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehicleImage } from './entities/vehicle-image.entity';
import { ReorderVehicleImagesDto } from './dto/reorder-vehicle-images.dto';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Injectable()
export class VehicleImagesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(VehicleImage)
    private readonly vehicleImagesRepository: Repository<VehicleImage>,
  ) {}

  async uploadImages(
    vehicleId: number,
    files: Express.Multer.File[],
  ): Promise<VehicleImage[]> {
    if (!files?.length) {
      throw new BadRequestException(
        'Debés enviar al menos una imagen en el campo files',
      );
    }

    const vehicle = await this.ensureVehicleExists(vehicleId);
    this.validateFiles(files);

    const existingImages = await this.getVehicleImages(vehicle.id);
    const folder = `concesionaria/vehicles/${vehicle.id}`;
    const uploadedImages: VehicleImage[] = [];
    const uploadedPublicIds: string[] = [];

    try {
      for (const file of files) {
        const uploadedFile = await this.cloudinaryService.uploadImage(
          file,
          folder,
        );
        uploadedPublicIds.push(uploadedFile.public_id);
        uploadedImages.push(
          this.vehicleImagesRepository.create({
            vehicleId: vehicle.id,
            url: uploadedFile.secure_url,
            publicId: uploadedFile.public_id,
            isCover: false,
            order: 0,
          }),
        );
      }

      return await this.dataSource.transaction(async (manager) => {
        const imageRepository = manager.getRepository(VehicleImage);
        const currentImages = await imageRepository.find({
          where: { vehicleId: vehicle.id },
          order: { order: 'ASC', id: 'ASC' },
        });

        let nextOrder =
          currentImages.reduce(
            (maxOrder, image) => Math.max(maxOrder, image.order),
            0,
          ) + 1;
        let hasCover = currentImages.some((image) => image.isCover);

        for (const image of uploadedImages) {
          image.order = nextOrder++;
          image.isCover = !hasCover;
          hasCover = true;
        }

        const savedImages = await imageRepository.save(uploadedImages);

        return [...existingImages, ...savedImages].sort(
          (a, b) => a.order - b.order,
        );
      });
    } catch (error) {
      for (const publicId of uploadedPublicIds) {
        await this.cloudinaryService.deleteImage(publicId).catch(() => null);
      }

      throw error;
    }
  }

  async setCover(vehicleId: number, imageId: number): Promise<VehicleImage> {
    await this.ensureVehicleExists(vehicleId);
    const image = await this.getVehicleImageOrFail(vehicleId, imageId);

    await this.dataSource.transaction(async (manager) => {
      const imageRepository = manager.getRepository(VehicleImage);

      await imageRepository.update({ vehicleId }, { isCover: false });
      await imageRepository.update({ id: image.id }, { isCover: true });
    });

    return this.getVehicleImageOrFail(vehicleId, imageId);
  }

  async reorderImages(
    vehicleId: number,
    reorderDto: ReorderVehicleImagesDto,
  ): Promise<VehicleImage[]> {
    await this.ensureVehicleExists(vehicleId);

    const existingImages = await this.getVehicleImages(vehicleId);
    if (!existingImages.length) {
      throw new BadRequestException(
        'El vehículo no tiene imágenes para reordenar',
      );
    }

    const ids = reorderDto.items.map((item) => item.imageId);
    const uniqueIds = new Set(ids);

    if (uniqueIds.size !== ids.length) {
      throw new BadRequestException('El payload contiene imageId duplicados');
    }

    if (existingImages.length !== reorderDto.items.length) {
      throw new BadRequestException(
        'Debés enviar el orden completo de todas las imágenes del vehículo',
      );
    }

    const existingIds = new Set(existingImages.map((image) => image.id));
    for (const imageId of ids) {
      if (!existingIds.has(imageId)) {
        throw new BadRequestException(
          `La imagen ${imageId} no pertenece al vehículo ${vehicleId}`,
        );
      }
    }

    const orderedItems = [...reorderDto.items]
      .sort((a, b) => a.order - b.order || a.imageId - b.imageId)
      .map((item, index) => ({
        imageId: item.imageId,
        order: index + 1,
      }));

    await this.dataSource.transaction(async (manager) => {
      const imageRepository = manager.getRepository(VehicleImage);

      for (const item of orderedItems) {
        await imageRepository.update(
          { id: item.imageId, vehicleId },
          { order: item.order },
        );
      }
    });

    return this.getVehicleImages(vehicleId);
  }

  async deleteImage(vehicleId: number, imageId: number): Promise<{
    message: string;
  }> {
    await this.ensureVehicleExists(vehicleId);
    const image = await this.getVehicleImageOrFail(vehicleId, imageId);

    await this.cloudinaryService.deleteImage(image.publicId);

    await this.dataSource.transaction(async (manager) => {
      const imageRepository = manager.getRepository(VehicleImage);

      await imageRepository.delete({ id: image.id, vehicleId });

      const remainingImages = await imageRepository.find({
        where: { vehicleId },
        order: { order: 'ASC', id: 'ASC' },
      });

      const deletedWasCover = image.isCover;
      let coverAssigned = remainingImages.some((remainingImage) =>
        deletedWasCover ? false : remainingImage.isCover,
      );

      for (const [index, remainingImage] of remainingImages.entries()) {
        remainingImage.order = index + 1;

        if (deletedWasCover) {
          remainingImage.isCover = !coverAssigned;
          coverAssigned = true;
          continue;
        }

        if (!coverAssigned) {
          remainingImage.isCover = index === 0;
          coverAssigned = remainingImage.isCover;
        }
      }

      if (remainingImages.length) {
        await imageRepository.save(remainingImages);
      }
    });

    return { message: 'Imagen eliminada correctamente' };
  }

  private validateFiles(files: Express.Multer.File[]): void {
    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new BadRequestException(
          `Tipo de archivo no permitido: ${file.mimetype}`,
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new BadRequestException(
          `El archivo ${file.originalname} supera el máximo permitido de 5MB`,
        );
      }
    }
  }

  private async ensureVehicleExists(vehicleId: number): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehículo ${vehicleId} no encontrado`);
    }

    return vehicle;
  }

  private async getVehicleImageOrFail(
    vehicleId: number,
    imageId: number,
  ): Promise<VehicleImage> {
    const image = await this.vehicleImagesRepository.findOne({
      where: { id: imageId, vehicleId },
    });

    if (!image) {
      throw new NotFoundException(
        `Imagen ${imageId} no encontrada para el vehículo ${vehicleId}`,
      );
    }

    return image;
  }

  private async getVehicleImages(vehicleId: number): Promise<VehicleImage[]> {
    return this.vehicleImagesRepository.find({
      where: { vehicleId },
      order: { order: 'ASC', id: 'ASC' },
    });
  }
}
