import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import {
  DocumentStatus,
  DocumentType,
  RelatedEntityType,
} from '../entities/generated-document.entity';

export class FindGeneratedDocumentsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por código de plantilla',
    example: 'sale-contract-v1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  templateCode?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de documento',
    enum: DocumentType,
    enumName: 'DocumentType',
  })
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de entidad relacionada',
    enum: RelatedEntityType,
    enumName: 'RelatedEntityType',
  })
  @IsOptional()
  @IsEnum(RelatedEntityType)
  relatedEntityType?: RelatedEntityType;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de entidad relacionada',
    example: '8d679f55-f0f3-4fd1-b784-d3a069d87d88',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  relatedEntityId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: DocumentStatus,
    enumName: 'DocumentStatus',
  })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
}
