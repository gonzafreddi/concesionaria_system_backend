import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { SaleStatus } from '../entities/sale.entity';

/**
 * UpdateSaleDto
 * 
 * DTO para actualizar una operación existente
 * 
 * RESTRICCIÓN: El frontend NO puede cambiar status directamente.
 * El status se actualiza automáticamente en SalesService según:
 * - Pagos confirmados
 * - Trade-ins agregados
 * - Validaciones de transición de estado
 * 
 * Solo se permite actualizar basePrice si status === DRAFT
 */

export class UpdateSaleDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiProperty({ required: false, type: String })
  @IsOptional()
  @IsDateString()
  saleDate?: string;

  // Status no se puede modificar directamente desde DTO
  // Se actualiza automáticamente en el servicio
}

