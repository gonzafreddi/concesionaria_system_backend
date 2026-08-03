import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseCategoriesController } from './expense-categories.controller';
import { Expense } from './entities/expense.entity';
import { ExpenseCategory } from './entities/expense-category.entity';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, ExpenseCategory])],
  controllers: [ExpensesController, ExpenseCategoriesController],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
