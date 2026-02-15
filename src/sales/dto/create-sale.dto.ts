import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsInt,
  IsOptional,
  IsEnum,
  IsDateString,
  Min,
  IsPositive,
} from 'class-validator';
import { SaleType } from '../entities/sale.entity';

/**
 * CreateSaleDto
 *
 * DTO para crear una nueva operación (SALE o PURCHASE)
 *
 * Campos requeridos:
 * - clientId: ID del cliente que compra/vende
 * - vehicleId: ID del vehículo involucrado
 * - userId: ID del vendedor/gestor
 * - basePrice: Precio inicial sin descuentos
 * - saleDate: Fecha de la operación
 *
 * Campos opcionales:
 * - quoteId: ID de cotización relacionada
 * - type: Tipo de operación (SALE | PURCHASE, default: SALE)
 *
 * Calculados automáticamente en SalesService:
 * - status: DRAFT
 * - finalPrice: = basePrice (se actualiza con trade-ins)
 * - totalPaid: 0
 */

export class CreateSaleDto {
  @ApiProperty({ required: false, description: 'ID de cotización opcional' })
  @IsOptional()
  @IsInt()
  quoteId?: number;

  @ApiProperty({ description: 'ID del cliente comprador/vendedor' })
  @IsInt()
  clientId: number;

  @ApiProperty({ description: 'ID del vehículo involucrado' })
  @IsInt()
  vehicleId: number;

  @ApiProperty({ description: 'ID del vendedor/gestor de la operación' })
  @IsInt()
  userId: number;

  @ApiProperty({
    enum: SaleType,
    default: SaleType.SALE,
    description: 'Tipo: SALE (venta) o PURCHASE (compra)',
  })
  @IsEnum(SaleType)
  type: SaleType = SaleType.SALE;

  @ApiProperty({
    description: 'Precio inicial sin descuentos',
    example: 250000,
  })
  @IsNumber()
  @IsPositive()
  basePrice: number;

  @ApiProperty({
    type: String,
    description: 'Fecha de la operación (ISO format)',
    example: '2026-02-11T10:00:00Z',
  })
  @IsDateString()
  saleDate: string;

  @IsNumber()
  @IsOptional()
  tradeIns?: number; // Se pueden agregar trade-ins al crear la venta, pero no es obligatorio
}
