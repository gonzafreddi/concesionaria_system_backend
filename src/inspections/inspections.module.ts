import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InspectionsService } from './inspections.service';
import { InspectionsController } from './inspections.controller';
import { Inspection } from './entities/inspection.entity';
import { Client } from 'src/clients/entities/client.entity';
import { Vehicle } from 'src/vehicles/entities/vehicle.entity';
import { VehiclesService } from 'src/vehicles/vehicles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inspection, Client, Vehicle, VehiclesService]),
  ],
  controllers: [InspectionsController],
  providers: [InspectionsService, VehiclesService],
  exports: [InspectionsService],
})
export class InspectionsModule {}
