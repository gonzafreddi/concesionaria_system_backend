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

const ALLOWED_MIME_TYPES = ['application/pdf'];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

@Injectable()
export class GeneratedDocumentsService {
  constructor(
    @InjectRepository(GeneratedDocument)
    private readonly documentsRepository: Repository<GeneratedDocument>,
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    createDto: CreateGeneratedDocumentDto,
  ): Promise<GeneratedDocument> {
    this.validateFile(file);
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
      generatedById: null,
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
  }
}
