import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ExpenseStatus } from '../entities/expense.entity';

export class CreateExpenseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  categoryId: number;

  @ApiProperty({ example: 'Factura de electricidad' })
  @IsString()
  @MaxLength(255)
  description: string;

  @ApiProperty({ example: 125000 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ enum: ExpenseStatus, default: ExpenseStatus.PENDING })
  @IsOptional()
  @IsEnum(ExpenseStatus)
  status?: ExpenseStatus;

  @ApiPropertyOptional({ example: '2026-08-03T15:30:00.000Z' })
  @IsOptional()
  @IsDateString()
  expenseDate?: string;

  @ApiPropertyOptional({ example: 'Edenor' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  supplierName?: string;

  @ApiPropertyOptional({ example: 'Periodo julio 2026' })
  @IsOptional()
  @IsString()
  notes?: string;
}
