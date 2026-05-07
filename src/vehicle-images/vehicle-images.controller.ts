import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { VehicleImagesService } from './vehicle-images.service';
import { VehicleImage } from './entities/vehicle-image.entity';
import { ReorderVehicleImagesDto } from './dto/reorder-vehicle-images.dto';
import { VehicleImageResponseDto } from './dto/vehicle-image-response.dto';
import { DeleteVehicleImageResponseDto } from './dto/delete-vehicle-image-response.dto';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

@ApiTags('vehicle-images')
@ApiBearerAuth()
@Controller('vehicles/:vehicleId/images')
export class VehicleImagesController {
  constructor(private readonly vehicleImagesService: VehicleImagesService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
        files: 10,
      },
      fileFilter: (_req, file, callback) => {
        if (
          !['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
        ) {
          callback(
            new BadRequestException(
              `Tipo de archivo no permitido: ${file.mimetype}`,
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir una o varias imágenes a un vehículo',
  })
  @ApiParam({ name: 'vehicleId', type: Number, description: 'ID del vehículo' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files'],
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Imágenes subidas y registradas correctamente',
    type: VehicleImageResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Archivos inválidos' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  uploadImages(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<VehicleImage[]> {
    return this.vehicleImagesService.uploadImages(vehicleId, files);
  }

  @Patch(':imageId/cover')
  @ApiOperation({
    summary: 'Marcar una imagen como portada',
  })
  @ApiParam({ name: 'vehicleId', type: Number, description: 'ID del vehículo' })
  @ApiParam({ name: 'imageId', type: Number, description: 'ID de la imagen' })
  @ApiResponse({
    status: 200,
    description: 'Imagen marcada como portada',
    type: VehicleImageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehículo o imagen no encontrados' })
  setCover(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ): Promise<VehicleImage> {
    return this.vehicleImagesService.setCover(vehicleId, imageId);
  }

  @Patch('reorder')
  @ApiOperation({
    summary: 'Reordenar imágenes de un vehículo',
  })
  @ApiParam({ name: 'vehicleId', type: Number, description: 'ID del vehículo' })
  @ApiBody({ type: ReorderVehicleImagesDto })
  @ApiResponse({
    status: 200,
    description: 'Imágenes reordenadas',
    type: VehicleImageResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 400, description: 'Payload de orden inválido' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  reorderImages(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Body() reorderDto: ReorderVehicleImagesDto,
  ): Promise<VehicleImage[]> {
    return this.vehicleImagesService.reorderImages(vehicleId, reorderDto);
  }

  @Delete(':imageId')
  @ApiOperation({
    summary: 'Eliminar una imagen de un vehículo',
  })
  @ApiParam({ name: 'vehicleId', type: Number, description: 'ID del vehículo' })
  @ApiParam({ name: 'imageId', type: Number, description: 'ID de la imagen' })
  @ApiResponse({
    status: 200,
    description: 'Imagen eliminada correctamente',
    type: DeleteVehicleImageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Vehículo o imagen no encontrados' })
  deleteImage(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ): Promise<{ message: string }> {
    return this.vehicleImagesService.deleteImage(vehicleId, imageId);
  }
}
