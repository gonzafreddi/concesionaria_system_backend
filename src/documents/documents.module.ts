import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document } from './entities/document.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Client } from '../clients/entities/client.entity';
import { Purchase } from '../purchase/entities/purchase.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Document,
      Sale,
      Purchase,
      Vehicle,
      Payment,
      Client,
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
