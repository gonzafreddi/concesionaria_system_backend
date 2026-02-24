import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsInt,
  IsOptional,
  IsEnum,
  IsDateString,
  IsPositive,
  Min,
  Max,
} from 'class-validator';
import { SaleType } from '../entities/sale.entity';
import { Type } from 'class-transformer';

export class CreateSaleDto {
  @ApiProperty({
    required: false,
    description: 'ID de cotización opcional asociada a la venta',
    example: 15,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  quoteId?: number;

  @ApiProperty({
    description: 'ID del cliente comprador/vendedor',
    example: 3,
  })
  @Type(() => Number)
  @IsInt()
  clientId: number;

  @ApiProperty({
    description: 'ID del vehículo involucrado en la operación',
    example: 12,
  })
  @Type(() => Number)
  @IsInt()
  vehicleId: number;

  @ApiProperty({
    description: 'ID del vendedor/gestor de la operación',
    example: 2,
  })
  @Type(() => Number)
  @IsInt()
  userId: number;

  @ApiProperty({
    enum: SaleType,
    default: SaleType.SALE,
    description: 'Tipo de operación: SALE (venta) o PURCHASE (compra)',
  })
  @IsEnum(SaleType)
  type: SaleType = SaleType.SALE;

  @ApiProperty({
    description: 'Precio inicial del vehículo sin aplicar descuentos',
    example: 25000000,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  basePrice: number;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Fecha de la operación en formato ISO 8601',
    example: '2026-02-11T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  saleDate?: string;

  @ApiProperty({
    required: false,
    description:
      'ID del vehículo entregado en parte de pago (trade-in). Opcional.',
    example: 8,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tradeIns?: number;

  @ApiProperty({
    required: false,
    description:
      'Descuento aplicado al precio base. Se resta antes de calcular transferencia.',
    example: 1500000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({
    required: false,
    description:
      'Porcentaje de transferencia aplicado sobre (basePrice - discount)',
    example: 1.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  transferPercentage?: number;

  @ApiProperty({
    required: false,
    description: 'Gastos administrativos fijos de la operación',
    example: 250000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  adminExpenses?: number;
}
