import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from '../expenses/entities/expense.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Purchase } from '../purchase/entities/purchase.entity';
import { Sale } from '../sales/entities/sale.entity';
import { VehicleExpense } from '../vehicle-expenses/entities/vehicle-expense.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Expense,
      Payment,
      Purchase,
      Sale,
      Vehicle,
      VehicleExpense,
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
