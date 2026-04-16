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
import { VehiclesModule } from '../vehicles/vehicles.module';
import { SaleAccountBalanceService } from './sale-account-balance.service';
import { SaleBalanceCalculatorService } from './sale-balance-calculator.service';

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
  providers: [
    SalesService,
    // Orquesta la lectura de la venta y compone la respuesta del balance
    SaleAccountBalanceService,
    // Encapsula la fórmula del saldo pendiente
    SaleBalanceCalculatorService,
  ],
  exports: [SalesService, SaleBalanceCalculatorService],
})
export class SalesModule {}
