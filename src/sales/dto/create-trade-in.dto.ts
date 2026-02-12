import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsInt, Min } from 'class-validator';

/**
 * CreateTradeInDto
 * 
 * DTO para registrar un vehículo como parte de pago (trade-in)
 * 
 * - vehicleId: ID del vehículo usado que se aporta
 * - tradeInValue: Valuación del vehículo (se descuenta de finalPrice)
 * 
 * Validaciones en SalesService:
 * - Vehicle debe existir
 * - Vehicle no puede estar en otra venta activa
 * - Sale no debe estar cerrada
 * - tradeInValue no puede exceder finalPrice
 */

export class CreateTradeInDto {
  @ApiProperty()
  @IsInt()
  saleId: number;

  @ApiProperty()
  @IsInt()
  vehicleId: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  tradeInValue: number;
}
