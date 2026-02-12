import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsInt, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

/**
 * CreatePaymentDto
 * 
 * DTO para registrar un nuevo pago en una operación
 * 
 * - amount: Monto a pagar
 * - method: Forma de pago
 * - notes: Información adicional (referencia, cheque, etc)
 * 
 * Validaciones en SalesService:
 * - Sale no debe estar cerrada (status !== DELIVERED)
 * - Sale.finalPrice >= Sale.totalPaid + amount (no sobre-pagar)
 */

export class CreatePaymentDto {
  @ApiProperty()
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
}
