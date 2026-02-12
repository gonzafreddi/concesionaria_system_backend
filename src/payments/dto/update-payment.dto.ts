import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaymentStatus } from '../entities/payment.entity';

/**
 * UpdatePaymentDto
 * 
 * DTO para actualizar estado de un pago existente
 * 
 * Solo se permite cambiar el status:
 * - PENDING → CONFIRMED: Pago recibido/validado
 * - PENDING → REJECTED: Pago rechazado
 * - CONFIRMED → REJECTED: Reversión de pago (recalcula Sale)
 * 
 * El monto NO se puede cambiar después de creado
 */

export class UpdatePaymentDto {
  @ApiProperty({ enum: PaymentStatus, required: false })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}
