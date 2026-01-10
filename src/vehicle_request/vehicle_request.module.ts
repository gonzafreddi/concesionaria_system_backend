import { Module } from '@nestjs/common';
import { VehicleRequestService } from './vehicle_request.service';
import { VehicleRequestController } from './vehicle_request.controller';

@Module({
  controllers: [VehicleRequestController],
  providers: [VehicleRequestService],
})
export class VehicleRequestModule {}
