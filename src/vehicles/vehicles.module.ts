import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { VehicleAcquisitionController } from './vehicle_acquisition.controller';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleAcquisitionTypes } from './entities/vehicle_acquisition_types';
import { VehicleAcquisitionService } from './vechicle_acquisition.service';
import { Inspection } from '../inspections/entities/inspection.entity';
import { VehicleImage } from '../vehicle-images/entities/vehicle-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehicle,
      VehicleAcquisitionTypes,
      Inspection,
      VehicleImage,
    ]),
  ],
  controllers: [VehiclesController, VehicleAcquisitionController],
  providers: [VehiclesService, VehicleAcquisitionService],
  exports: [VehiclesService, VehicleAcquisitionService],
})
export class VehiclesModule {}
