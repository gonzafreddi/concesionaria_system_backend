import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsignmentStatus } from '../entities/consignment.entity';

export class CreateConsignmentDto {
  @ApiProperty({ example: 10, description: 'ID del vehiculo consignado' })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  vehicleId: number;

  @ApiProperty({
    example: 25,
    description: 'ID del cliente dueño del vehiculo',
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  ownerClientId: number;

  @ApiProperty({
    example: 13500000,
    description: 'Precio de toma acordado con el dueño',
  })
  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  takePrice: number;

  @ApiProperty({
    example: 14950000,
    description: 'Precio estimado de venta al publico',
  })
  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  estimatedSalePrice: number;

  @ApiPropertyOptional({
    enum: ConsignmentStatus,
    default: ConsignmentStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ConsignmentStatus)
  status?: ConsignmentStatus;

  @ApiPropertyOptional({
    example: 'Recibido con cédula, titulo y segundo juego de llaves.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1500)
  notes?: string;
}
