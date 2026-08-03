import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsInt,
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';
import {
  Currency,
  PaymentMethod,
  PaymentStatus,
  PaymentConcept,
} from '../entities/payment.entity';
import { Transform, type TransformFnParams } from 'class-transformer';

/**
 * CreatePaymentDto
 *
 * DTO para registrar un nuevo pago en una operación
 *
 * - amount: Monto a pagar
 * - method: Forma de pago
 * - notes: Información adicional (referencia, cheque, etc)
 *
 * Validaciones de negocio:
 * - Sale no debe estar confirmada ni cancelada
 * - Sale.finalPrice >= Sale.totalPaid + tradeIns + amount (no sobre-pagar)
 */

export class CreatePaymentDto {
  @ApiProperty()
  @Transform(({ value }: TransformFnParams) => parseInt(String(value), 10))
  @IsInt()
  saleId: number;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, enum: PaymentConcept })
  @IsOptional()
  @IsEnum(PaymentConcept)
  concept?: PaymentConcept;

  @ApiProperty({ required: true, enum: Currency })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ required: false, enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiProperty({
    required: false,
    description:
      'Fecha efectiva del pago. Solo se usa si el pago ingresa confirmado.',
  })
  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
