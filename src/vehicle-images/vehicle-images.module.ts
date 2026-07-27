import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehicleImage } from './entities/vehicle-image.entity';
import { VehicleImagesController } from './vehicle-images.controller';
import { VehicleImagesService } from './vehicle-images.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, VehicleImage])],
  controllers: [VehicleImagesController],
  providers: [VehicleImagesService],
  exports: [VehicleImagesService],
})
export class VehicleImagesModule {}
