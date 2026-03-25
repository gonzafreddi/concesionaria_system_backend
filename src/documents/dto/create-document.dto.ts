import { Transform } from 'class-transformer';
import {
  IsBase64,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DocumentStatus,
  DocumentType,
} from '../entities/document.entity';

/**
 * DTO para crear un documento.
 *
 * Los vínculos con compra, venta, vehículo, pago y cliente son opcionales para poder
 * reutilizar el módulo con distintos flujos del negocio.
 */
export class CreateDocumentDto {
  @ApiProperty({
    description: 'Tipo de documento a registrar',
    enum: DocumentType,
    enumName: 'DocumentType',
  })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiPropertyOptional({
    description: 'Estado inicial del documento',
    enum: DocumentStatus,
    enumName: 'DocumentStatus',
    default: DocumentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiProperty({
    description: 'Título del documento',
    maxLength: 255,
    example: 'Boleto compra-venta Peugeot 208',
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'ID de la compra asociada',
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined || value === ''
      ? null
      : Number(value),
  )
  @IsInt()
  @Min(1)
  purchaseId?: number | null;

  @ApiPropertyOptional({
    description: 'ID de la venta asociada',
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined || value === ''
      ? null
      : Number(value),
  )
  @IsInt()
  @Min(1)
  saleId?: number | null;

  @ApiPropertyOptional({
    description: 'ID del vehículo asociado',
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined || value === ''
      ? null
      : Number(value),
  )
  @IsInt()
  @Min(1)
  vehicleId?: number | null;

  @ApiPropertyOptional({
    description: 'ID del pago asociado',
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined || value === ''
      ? null
      : Number(value),
  )
  @IsInt()
  @Min(1)
  paymentId?: number | null;

  @ApiPropertyOptional({
    description: 'ID del cliente asociado',
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === null || value === undefined || value === ''
      ? null
      : Number(value),
  )
  @IsInt()
  @Min(1)
  clientId?: number | null;

  @ApiProperty({
    description:
      'Contenido del PDF generado codificado en base64 para persistir el binario',
    type: String,
    format: 'byte',
  })
  @IsBase64()
  pdfData: string;

  @ApiPropertyOptional({
    description: 'Contenido del PDF firmado codificado en base64',
    nullable: true,
    type: String,
    format: 'byte',
  })
  @IsOptional()
  @IsBase64()
  signedPdfData?: string | null;

  @ApiPropertyOptional({
    description: 'Snapshot JSON con la información usada para generar el PDF',
    nullable: true,
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  dataSnapshotJson?: Record<string, unknown> | null;
}
