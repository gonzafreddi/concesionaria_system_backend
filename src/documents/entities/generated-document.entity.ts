import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DocumentType {
  CONTRACT = 'CONTRACT',
  RECEIPT = 'RECEIPT',
  AUTHORIZATION = 'AUTHORIZATION',
  DELIVERY_NOTE = 'DELIVERY_NOTE',
  QUOTE = 'QUOTE',
  INTERNAL = 'INTERNAL',
}

export enum DocumentStatus {
  GENERATED = 'GENERATED',
  SIGNED = 'SIGNED',
  CANCELLED = 'CANCELLED',
}

export enum RelatedEntityType {
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  PAYMENT = 'PAYMENT',
  VEHICLE = 'VEHICLE',
  CLIENT = 'CLIENT',
  CONSIGNMENT = 'CONSIGNMENT',
}

@Entity('generated_documents')
@Index(['relatedEntityType', 'relatedEntityId'])
@Index(['documentType', 'status'])
@Index(['templateCode'])
export class GeneratedDocument {
  @ApiProperty({ description: 'Identificador único del documento' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Código de la plantilla usada en frontend para generar el PDF',
    example: 'sale-contract-v1',
  })
  @Column({ name: 'template_code', type: 'varchar', length: 100 })
  templateCode: string;

  @ApiProperty({
    description: 'Tipo funcional del documento',
    enum: DocumentType,
    enumName: 'DocumentType',
  })
  @Column({ name: 'document_type', type: 'enum', enum: DocumentType })
  documentType: DocumentType;

  @ApiProperty({
    description: 'Tipo de entidad relacionada',
    enum: RelatedEntityType,
    enumName: 'RelatedEntityType',
  })
  @Column({ name: 'related_entity_type', type: 'enum', enum: RelatedEntityType })
  relatedEntityType: RelatedEntityType;

  @ApiProperty({
    description: 'ID de la entidad relacionada',
    example: '8d679f55-f0f3-4fd1-b784-d3a069d87d88',
  })
  @Column({ name: 'related_entity_id', type: 'varchar', length: 100 })
  relatedEntityId: string;

  @ApiProperty({
    description: 'URL del archivo PDF almacenado',
    example: '/documents/8d679f55-f0f3-4fd1-b784-d3a069d87d88/file',
  })
  @Column({ name: 'file_url', type: 'text' })
  fileUrl: string;

  @ApiPropertyOptional({
    description: 'Public ID del proveedor de storage para futuras operaciones',
    nullable: true,
    example: 'concesionaria/documents/SALE/123/contract-1710000000',
  })
  @Column({ name: 'file_public_id', type: 'varchar', length: 255, nullable: true })
  filePublicId: string | null;

  @Exclude()
  @Column({ name: 'file_data', type: 'bytea', select: false })
  fileData: Buffer;

  @ApiProperty({
    description: 'Nombre original del archivo enviado por frontend',
    example: 'contrato-venta.pdf',
  })
  @Column({ name: 'original_file_name', type: 'varchar', length: 255 })
  originalFileName: string;

  @ApiProperty({
    description: 'Mime type del archivo almacenado',
    example: 'application/pdf',
  })
  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @ApiProperty({
    description: 'Tamaño del archivo en bytes',
    example: 248392,
  })
  @Column({ type: 'integer' })
  size: number;

  @ApiProperty({
    description: 'Estado del documento',
    enum: DocumentStatus,
    enumName: 'DocumentStatus',
    default: DocumentStatus.GENERATED,
  })
  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.GENERATED,
  })
  status: DocumentStatus;

  @ApiPropertyOptional({
    description: 'ID del usuario que generó o subió el documento',
    nullable: true,
    example: 'user-123',
  })
  @Column({ name: 'generated_by_id', type: 'varchar', length: 100, nullable: true })
  generatedById: string | null;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización del registro' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
