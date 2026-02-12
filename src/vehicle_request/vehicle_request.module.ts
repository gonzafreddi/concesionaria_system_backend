import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleRequestService } from './vehicle_request.service';
import { VehicleRequestController } from './vehicle_request.controller';
import { VehicleRequest } from './entities/vehicle_request.entity';
import { Client } from '../clients/entities/client.entity';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleRequest, Client, User, Vehicle])],
  controllers: [VehicleRequestController],
  providers: [VehicleRequestService],
  exports: [VehicleRequestService],
})
export class VehicleRequestModule {}
