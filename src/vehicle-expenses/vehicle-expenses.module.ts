import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehicleExpense } from './entities/vehicle-expense.entity';
import { VehicleExpensesController } from './vehicle-expenses.controller';
import { VehicleExpensesService } from './vehicle-expenses.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, VehicleExpense])],
  controllers: [VehicleExpensesController],
  providers: [VehicleExpensesService],
  exports: [VehicleExpensesService],
})
export class VehicleExpensesModule {}
