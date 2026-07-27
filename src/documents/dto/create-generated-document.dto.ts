import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  DocumentStatus,
  DocumentType,
  RelatedEntityType,
} from '../entities/generated-document.entity';

export class CreateGeneratedDocumentDto {
  @ApiProperty({
    description: 'Código de plantilla utilizado por el frontend',
    example: 'sale-contract-v1',
  })
  @IsString()
  @MaxLength(100)
  templateCode: string;

  @ApiProperty({
    description: 'Tipo funcional del documento',
    enum: DocumentType,
    enumName: 'DocumentType',
  })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({
    description: 'Tipo de entidad relacionada',
    enum: RelatedEntityType,
    enumName: 'RelatedEntityType',
  })
  @IsEnum(RelatedEntityType)
  relatedEntityType: RelatedEntityType;

  @ApiProperty({
    description: 'Identificador de la entidad relacionada',
    example: '8d679f55-f0f3-4fd1-b784-d3a069d87d88',
  })
  @IsString()
  @MaxLength(100)
  relatedEntityId: string;

  @ApiPropertyOptional({
    description: 'Estado inicial del documento',
    enum: DocumentStatus,
    enumName: 'DocumentStatus',
    default: DocumentStatus.GENERATED,
  })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
}
