import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Purchase } from '../../purchase/entities/purchase.entity';

/**
 * Tipos de documentos que maneja el sistema.
 */
export enum DocumentType {
  PURCHASE_AGREEMENT = 'PURCHASE_AGREEMENT',
  PAYMENT_RECEIPT = 'PAYMENT_RECEIPT',
  PROFORMA = 'PROFORMA',
  CONSIGNMENT_CONTRACT = 'CONSIGNMENT_CONTRACT',
  PRE_DELIVERY_CHECKLIST = 'PRE_DELIVERY_CHECKLIST',
  TRADE_IN_INSPECTION = 'TRADE_IN_INSPECTION',
  TRANSFER_COST_ESTIMATE = 'TRANSFER_COST_ESTIMATE',
}

/**
 * Estados posibles de un documento.
 */
export enum DocumentStatus {
  DRAFT = 'DRAFT',
  GENERATED = 'GENERATED',
  SIGNED = 'SIGNED',
  CANCELLED = 'CANCELLED',
}

/**
 * Document Entity
 *
 * Representa un documento generado por el sistema y su vínculo opcional con
 * una compra, venta, vehículo, pago o cliente.
 */
@Entity('documents')
export class Document {
  @ApiProperty({ description: 'Identificador único del documento' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Tipo funcional del documento',
    enum: DocumentType,
    enumName: 'DocumentType',
  })
  @Column({ type: 'enum', enum: DocumentType })
  type: DocumentType;

  @ApiProperty({
    description: 'Estado actual del documento',
    enum: DocumentStatus,
    enumName: 'DocumentStatus',
    default: DocumentStatus.DRAFT,
  })
  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @ApiProperty({ description: 'Título o nombre visible del documento' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiPropertyOptional({
    description: 'ID de la compra asociada, si corresponde',
    nullable: true,
  })
  @Index()
  @Column({ name: 'purchase_id', type: 'int', nullable: true })
  purchaseId: number | null;

  @ApiPropertyOptional({
    description: 'ID de la venta asociada, si corresponde',
    nullable: true,
  })
  @Index()
  @Column({ name: 'sale_id', type: 'int', nullable: true })
  saleId: number | null;

  @ApiPropertyOptional({
    description: 'ID del vehículo asociado, si corresponde',
    nullable: true,
  })
  @Index()
  @Column({ name: 'vehicle_id', type: 'int', nullable: true })
  vehicleId: number | null;

  @ApiPropertyOptional({
    description: 'ID del pago asociado, si corresponde',
    nullable: true,
  })
  @Index()
  @Column({ name: 'payment_id', type: 'int', nullable: true })
  paymentId: number | null;

  @ApiPropertyOptional({
    description: 'ID del cliente asociado, si corresponde',
    nullable: true,
  })
  @Index()
  @Column({ name: 'client_id', type: 'int', nullable: true })
  clientId: number | null;

  @ApiProperty({
    description:
      'Contenido binario del PDF generado, expuesto como string base64 en la API',
    type: String,
    format: 'byte',
  })
  @Transform(
    ({ value }) => (Buffer.isBuffer(value) ? value.toString('base64') : value),
    { toPlainOnly: true },
  )
  @Column({ name: 'pdf_data', type: 'bytea' })
  pdfData: Buffer;

  @ApiPropertyOptional({
    description:
      'Contenido binario del PDF firmado, expuesto como string base64 en la API',
    nullable: true,
    type: String,
    format: 'byte',
  })
  @Transform(
    ({ value }) => (Buffer.isBuffer(value) ? value.toString('base64') : value),
    { toPlainOnly: true },
  )
  @Column({ name: 'signed_pdf_data', type: 'bytea', nullable: true })
  signedPdfData: Buffer | null;

  @ApiPropertyOptional({
    description:
      'Snapshot JSON con los datos utilizados al momento de generar el documento',
    nullable: true,
    type: 'object',
    additionalProperties: true,
  })
  @Column({ name: 'data_snapshot_json', type: 'jsonb', nullable: true })
  dataSnapshotJson: Record<string, unknown> | null;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización del registro' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Purchase, (purchase) => purchase.documents, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'purchase_id' })
  purchase: Purchase | null;
}
