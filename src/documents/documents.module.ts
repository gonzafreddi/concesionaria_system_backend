import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratedDocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { GeneratedDocument } from './entities/generated-document.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Purchase } from '../purchase/entities/purchase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GeneratedDocument, Sale, Purchase])],
  controllers: [DocumentsController],
  providers: [GeneratedDocumentsService],
})
export class DocumentsModule {}
