import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneratedDocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { GeneratedDocument } from './entities/generated-document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GeneratedDocument])],
  controllers: [DocumentsController],
  providers: [GeneratedDocumentsService],
})
export class DocumentsModule {}
