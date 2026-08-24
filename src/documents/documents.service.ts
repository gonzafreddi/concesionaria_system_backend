import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { CreateGeneratedDocumentDto } from './dto/create-generated-document.dto';
import { FindGeneratedDocumentsQueryDto } from './dto/find-generated-documents-query.dto';
import {
  DocumentStatus,
  GeneratedDocument,
  RelatedEntityType,
} from './entities/generated-document.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Purchase } from '../purchase/entities/purchase.entity';
import { Quote } from '../quotes/entities/quote.entity';

const ALLOWED_MIME_TYPES = ['application/pdf'];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

@Injectable()
export class GeneratedDocumentsService {
  constructor(
    @InjectRepository(GeneratedDocument)
    private readonly documentsRepository: Repository<GeneratedDocument>,
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    createDto: CreateGeneratedDocumentDto,
    generatedById: string | null,
  ): Promise<GeneratedDocument> {
    this.validateFile(file);
    await this.validateRelatedEntity(createDto);

    const documentId = randomUUID();

    const document = this.documentsRepository.create({
      id: documentId,
      templateCode: createDto.templateCode,
      documentType: createDto.documentType,
      relatedEntityType: createDto.relatedEntityType,
      relatedEntityId: createDto.relatedEntityId,
      fileUrl: `/documents/${documentId}/file`,
      filePublicId: null,
      fileData: file.buffer,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      status: createDto.status ?? DocumentStatus.GENERATED,
      generatedById,
    });

    return this.documentsRepository.save(document);
  }

  findAll(query: FindGeneratedDocumentsQueryDto): Promise<GeneratedDocument[]> {
    return this.documentsRepository.find({
      where: {
        templateCode: query.templateCode,
        documentType: query.documentType,
        relatedEntityType: query.relatedEntityType,
        relatedEntityId: query.relatedEntityId,
        status: query.status,
      },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: string): Promise<GeneratedDocument> {
    const document = await this.documentsRepository.findOne({ where: { id } });

    if (!document) {
      throw new NotFoundException(`Documento ${id} no encontrado`);
    }

    return document;
  }

  async getFile(id: string): Promise<GeneratedDocument> {
    const document = await this.documentsRepository
      .createQueryBuilder('document')
      .addSelect('document.fileData')
      .where('document.id = :id', { id })
      .getOne();

    if (!document) {
      throw new NotFoundException(`Documento ${id} no encontrado`);
    }

    return document;
  }

  async findByEntity(
    relatedEntityType: RelatedEntityType,
    relatedEntityId: string,
  ): Promise<GeneratedDocument[]> {
    return this.documentsRepository.find({
      where: { relatedEntityType, relatedEntityId },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  async remove(id: string): Promise<{ deleted: true }> {
    const document = await this.findOne(id);

    await this.documentsRepository.remove(document);
    return { deleted: true };
  }

  private validateFile(file?: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException(
        'Debés enviar un archivo PDF en el campo file',
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido: ${file.mimetype}`,
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        'El archivo supera el máximo permitido de 15MB',
      );
    }

    const header = file.buffer.subarray(0, 1024).toString('latin1');
    if (!header.includes('%PDF-')) {
      throw new BadRequestException(
        'El contenido del archivo no corresponde a un PDF válido',
      );
    }
  }

  private async validateRelatedEntity(
    createDto: CreateGeneratedDocumentDto,
  ): Promise<void> {
    const entityId = Number(createDto.relatedEntityId);
    const requiresNumericId = [
      RelatedEntityType.SALE,
      RelatedEntityType.PURCHASE,
      RelatedEntityType.QUOTE,
    ].includes(createDto.relatedEntityType);

    if (requiresNumericId && (!Number.isInteger(entityId) || entityId <= 0)) {
      throw new BadRequestException(
        'El ID de la entidad relacionada debe ser un numero entero positivo',
      );
    }

    if (createDto.relatedEntityType === RelatedEntityType.SALE) {
      const saleExists = await this.salesRepository.exists({
        where: { id: entityId },
      });

      if (!saleExists) {
        throw new NotFoundException(
          'Venta ' + createDto.relatedEntityId + ' no encontrada',
        );
      }
    }

    if (createDto.relatedEntityType === RelatedEntityType.PURCHASE) {
      const purchaseExists = await this.purchaseRepository.exists({
        where: { id: entityId },
      });

      if (!purchaseExists) {
        throw new NotFoundException(
          'Compra ' + createDto.relatedEntityId + ' no encontrada',
        );
      }
    }

    if (createDto.relatedEntityType === RelatedEntityType.QUOTE) {
      const quoteExists = await this.quoteRepository.exists({
        where: { id: entityId },
      });

      if (!quoteExists) {
        throw new NotFoundException(
          'Cotizacion ' + createDto.relatedEntityId + ' no encontrada',
        );
      }
    }
  }
}
