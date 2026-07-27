import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  VehicleExpenseStatus,
  VehicleExpenseType,
} from '../entities/vehicle-expense.entity';

export class CreateVehicleExpenseDto {
  @ApiProperty({
    enum: VehicleExpenseType,
    enumName: 'VehicleExpenseType',
    example: VehicleExpenseType.MECHANICAL,
  })
  @IsEnum(VehicleExpenseType)
  type: VehicleExpenseType;

  @ApiProperty({ example: 'Cambio de aceite y filtros' })
  @IsString()
  @MaxLength(255)
  description: string;

  @ApiProperty({ example: 150000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({
    enum: VehicleExpenseStatus,
    enumName: 'VehicleExpenseStatus',
    default: VehicleExpenseStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(VehicleExpenseStatus)
  status?: VehicleExpenseStatus;

  @ApiPropertyOptional({
    example: '2026-07-26T15:30:00.000Z',
    description: 'Si no se envía, se usa la fecha actual',
  })
  @IsOptional()
  @IsDateString()
  expenseDate?: string;

  @ApiPropertyOptional({ example: 'Taller Central' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  supplierName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
