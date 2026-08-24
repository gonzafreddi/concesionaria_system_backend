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
import { Location } from '../locations/entities/location.entity';
import { VehicleLocationMovement } from './entities/vehicle-location-movement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehicle,
      VehicleAcquisitionTypes,
      Inspection,
      VehicleImage,
      Location,
      VehicleLocationMovement,
    ]),
  ],
  controllers: [VehiclesController, VehicleAcquisitionController],
  providers: [VehiclesService, VehicleAcquisitionService],
  exports: [VehiclesService, VehicleAcquisitionService],
})
export class VehiclesModule {}
