import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Document, DocumentStatus } from './entities/document.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Client } from '../clients/entities/client.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentsRepository: Repository<Document>,
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
  ) {}

  /**
   * Crea un documento nuevo validando previamente las referencias opcionales.
   */
  async create(createDocumentDto: CreateDocumentDto): Promise<Document> {
    await this.validateReferences(createDocumentDto);

    const document = this.documentsRepository.create({
      type: createDocumentDto.type,
      status: createDocumentDto.status ?? DocumentStatus.DRAFT,
      title: createDocumentDto.title,
      saleId: createDocumentDto.saleId ?? null,
      vehicleId: createDocumentDto.vehicleId ?? null,
      paymentId: createDocumentDto.paymentId ?? null,
      clientId: createDocumentDto.clientId ?? null,
      pdfData: Buffer.from(createDocumentDto.pdfData, 'base64'),
      signedPdfData: createDocumentDto.signedPdfData
        ? Buffer.from(createDocumentDto.signedPdfData, 'base64')
        : null,
      dataSnapshotJson: createDocumentDto.dataSnapshotJson ?? null,
    });

    return this.documentsRepository.save(document);
  }

  /**
   * Devuelve todos los documentos ordenados por fecha de creación descendente.
   */
  findAll(): Promise<Document[]> {
    return this.documentsRepository.find({
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  /**
   * Busca un documento puntual por ID.
   */
  async findOne(id: number): Promise<Document> {
    const document = await this.documentsRepository.findOne({ where: { id } });

    if (!document) {
      throw new NotFoundException(`Documento ${id} no encontrado`);
    }

    return document;
  }

  /**
   * Actualiza parcialmente un documento existente.
   */
  async update(
    id: number,
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<Document> {
    const document = await this.findOne(id);
    await this.validateReferences(updateDocumentDto);

    Object.assign(document, {
      ...updateDocumentDto,
      saleId:
        updateDocumentDto.saleId === undefined
          ? document.saleId
          : updateDocumentDto.saleId,
      vehicleId:
        updateDocumentDto.vehicleId === undefined
          ? document.vehicleId
          : updateDocumentDto.vehicleId,
      paymentId:
        updateDocumentDto.paymentId === undefined
          ? document.paymentId
          : updateDocumentDto.paymentId,
      clientId:
        updateDocumentDto.clientId === undefined
          ? document.clientId
          : updateDocumentDto.clientId,
      pdfData:
        updateDocumentDto.pdfData === undefined
          ? document.pdfData
          : Buffer.from(updateDocumentDto.pdfData, 'base64'),
      signedPdfData:
        updateDocumentDto.signedPdfData === undefined
          ? document.signedPdfData
          : updateDocumentDto.signedPdfData
            ? Buffer.from(updateDocumentDto.signedPdfData, 'base64')
            : null,
      dataSnapshotJson:
        updateDocumentDto.dataSnapshotJson === undefined
          ? document.dataSnapshotJson
          : updateDocumentDto.dataSnapshotJson,
    });

    return this.documentsRepository.save(document);
  }

  /**
   * Elimina un documento existente.
   */
  async remove(id: number): Promise<{ deleted: true }> {
    const document = await this.findOne(id);
    await this.documentsRepository.remove(document);
    return { deleted: true };
  }

  /**
   * Valida que las referencias opcionales apunten a registros existentes.
   */
  private async validateReferences(
    documentDto: Partial<CreateDocumentDto>,
  ): Promise<void> {
    if (documentDto.saleId !== undefined && documentDto.saleId !== null) {
      const sale = await this.salesRepository.findOne({
        where: { id: documentDto.saleId },
      });
      if (!sale) {
        throw new NotFoundException(
          `Venta ${documentDto.saleId} no encontrada`,
        );
      }
    }

    if (documentDto.vehicleId !== undefined && documentDto.vehicleId !== null) {
      const vehicle = await this.vehiclesRepository.findOne({
        where: { id: documentDto.vehicleId },
      });
      if (!vehicle) {
        throw new NotFoundException(
          `Vehículo ${documentDto.vehicleId} no encontrado`,
        );
      }
    }

    if (documentDto.paymentId !== undefined && documentDto.paymentId !== null) {
      const payment = await this.paymentsRepository.findOne({
        where: { id: documentDto.paymentId },
      });
      if (!payment) {
        throw new NotFoundException(`Pago ${documentDto.paymentId} no encontrado`);
      }
    }

    if (documentDto.clientId !== undefined && documentDto.clientId !== null) {
      const client = await this.clientsRepository.findOne({
        where: { id: documentDto.clientId },
      });
      if (!client) {
        throw new NotFoundException(
          `Cliente ${documentDto.clientId} no encontrado`,
        );
      }
    }
  }
}
