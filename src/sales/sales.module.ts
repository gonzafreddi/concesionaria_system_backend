import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Sale } from './entities/sale.entity';
import { TradeIn } from './entities/trade-in.entity';
import { Quote } from '../quotes/entities/quote.entity';
import { Client } from '../clients/entities/client.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { User } from '../users/entities/user.entity';
import { Payment } from '../payments/entities/payment.entity';
import { VehiclesModule } from 'src/vehicles/vehicles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sale,
      TradeIn,
      Quote,
      Client,
      Vehicle,
      User,
      Payment,
    ]),
    VehiclesModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
