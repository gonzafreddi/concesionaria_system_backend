import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsInt, IsOptional, Min } from 'class-validator';

/**
 * CreateTradeInDto
 *
 * DTO para registrar un vehículo como parte de pago (trade-in)
 *
 * - vehicleId: ID del vehículo usado que se aporta
 * - tradeInValue: legado/opcional; la valuación se toma del acquisitionPrice del vehículo
 *
 * Validaciones en SalesService:
 * - Vehicle debe existir
 * - Vehicle no puede estar en otra venta activa
 * - Sale no debe estar cerrada
 * - acquisitionPrice no puede exceder finalPrice
 */

export class CreateTradeInDto {
  @ApiProperty()
  @IsInt()
  saleId: number;

  @ApiProperty()
  @IsInt()
  vehicleId: number;

  @ApiProperty({
    required: false,
    description:
      'Campo legado. La valuación se calcula desde el precio de adquisición del vehículo.',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tradeInValue?: number;
}
