import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { ServiceOrderPriority } from '../entities/service-order.entity';

export class CreateServiceOrderDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  clientId: number;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  vehicleId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ enum: ServiceOrderPriority })
  @IsOptional()
  @IsEnum(ServiceOrderPriority)
  priority?: ServiceOrderPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @IsPositive()
  assignedUserId?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Min(0)
  estimatedCost?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
