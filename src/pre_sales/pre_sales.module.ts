import { Module } from '@nestjs/common';
import { PreSalesService } from './pre_sales.service';
import { PreSalesController } from './pre_sales.controller';

@Module({
  controllers: [PreSalesController],
  providers: [PreSalesService],
})
export class PreSalesModule {}
