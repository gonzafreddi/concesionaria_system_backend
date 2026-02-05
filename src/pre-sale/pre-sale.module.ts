import { Module } from '@nestjs/common';
import { PreSaleService } from './pre-sale.service';
import { PreSaleController } from './pre-sale.controller';

@Module({
  controllers: [PreSaleController],
  providers: [PreSaleService],
})
export class PreSaleModule {}
