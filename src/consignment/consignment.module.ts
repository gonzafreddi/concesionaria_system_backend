import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consignment } from './entities/consignment.entity';
import { ConsignmentService } from './consignment.service';
import { ConsignmentController } from './consignment.controller';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Client } from '../clients/entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Consignment, Vehicle, Client])],
  controllers: [ConsignmentController],
  providers: [ConsignmentService],
  exports: [ConsignmentService],
})
export class ConsignmentModule {}
