import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsInt,
  IsOptional,
  IsDateString,
  IsPositive,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsEnum,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Currency,
  PaymentConcept,
  PaymentMethod,
  PaymentStatus,
} from '../../payments/entities/payment.entity';

export class CreateInitialPaymentDto {
  @ApiProperty({ example: 500000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ enum: Currency })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ required: false, enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({ required: false, enum: PaymentConcept })
  @IsOptional()
  @IsEnum(PaymentConcept)
  concept?: PaymentConcept;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

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
      'Campo legado/opcional. La valuación del trade-in se toma del precio de adquisición del vehículo.',
    example: 8000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tradeInValue?: number;

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

  @ApiProperty({
    required: false,
    type: CreateInitialPaymentDto,
    isArray: true,
    description:
      'Pagos iniciales cargados al crear la venta: seña, contado, entrega inicial, etc.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInitialPaymentDto)
  initialPayments?: CreateInitialPaymentDto[];
}
