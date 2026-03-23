import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import {
  DocumentationStatus,
  SaleStatus,
  TransferStatus,
} from '../entities/sale.entity';

export class UpdateSaleWorkflowStatusDto {
  @ApiProperty({
    required: false,
    enum: SaleStatus,
    description:
      'Estado financiero manual. Solo se permite CANCELLED desde este endpoint.',
  })
  @IsOptional()
  @IsEnum(SaleStatus)
  status?: SaleStatus;

  @ApiProperty({
    required: false,
    enum: DocumentationStatus,
    description: 'Estado documental de la operación',
  })
  @IsOptional()
  @IsEnum(DocumentationStatus)
  documentationStatus?: DocumentationStatus;

  @ApiProperty({
    required: false,
    enum: TransferStatus,
    description: 'Estado de transferencia de la operación',
  })
  @IsOptional()
  @IsEnum(TransferStatus)
  transferStatus?: TransferStatus;
}
