import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PurchaseStatus } from '../entities/purchase.entity';

/**
 * DTO para crear una compra de vehículo.
 */
export class CreatePurchaseDto {
  @ApiProperty({
    description: 'ID del cliente vendedor',
    example: 10,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  clientId: number;

  @ApiProperty({
    description: 'ID del vehículo adquirido por la concesionaria',
    example: 25,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  vehicleId: number;

  @ApiProperty({
    description: 'Monto pactado por la compra del vehículo',
    example: 13500000,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  agreedPrice: number;

  @ApiPropertyOptional({
    description: 'Estado inicial de la compra',
    enum: PurchaseStatus,
    enumName: 'PurchaseStatus',
    default: PurchaseStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(PurchaseStatus)
  status?: PurchaseStatus;

  @ApiPropertyOptional({
    description: 'Fecha de la compra',
    example: '2026-03-24T15:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    description: 'Notas internas de la operación',
    maxLength: 1500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1500)
  notes?: string;
}
