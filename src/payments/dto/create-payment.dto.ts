import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsInt,
  IsEnum,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Currency, PaymentMethod } from '../entities/payment.entity';
import { Transform } from 'class-transformer';

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
  @Transform(({ value }) => parseInt(value, 10))
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

  @ApiProperty({ required: true, enum: Currency })
  @IsEnum(Currency)
  currency: Currency;
}
