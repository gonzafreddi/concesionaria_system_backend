import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../clients/entities/client.entity';
import { Consignment } from '../consignment/entities/consignment.entity';
import { Inspection } from '../inspections/entities/inspection.entity';
import { Payment } from '../payments/entities/payment.entity';
import { PreSaleAesthetic } from '../pre-sale/entities/pre_sale_aesthetic.entity';
import { PreSaleBodywork } from '../pre-sale/entities/pre_sale_bodywork.entity';
import { PreSaleDocumentation } from '../pre-sale/entities/pre_sale_documentation.entity';
import { PreSaleMechanical } from '../pre-sale/entities/pre_sale_mechanical.entity';
import { Sale } from '../sales/entities/sale.entity';
import { VehicleExpense } from '../vehicle-expenses/entities/vehicle-expense.entity';
import { VehicleRequest } from '../vehicle_request/entities/vehicle_request.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vehicle,
      VehicleExpense,
      Sale,
      Payment,
      Client,
      Inspection,
      Consignment,
      VehicleRequest,
      PreSaleDocumentation,
      PreSaleMechanical,
      PreSaleAesthetic,
      PreSaleBodywork,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
