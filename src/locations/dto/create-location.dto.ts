import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { LocationType } from '../entities/location.entity';

export class CreateLocationDto {
  @ApiProperty({ example: 'Deposito Central' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({
    enum: LocationType,
    enumName: 'LocationType',
    default: LocationType.DEPOSIT,
  })
  @IsOptional()
  @IsEnum(LocationType)
  type?: LocationType;

  @ApiPropertyOptional({ example: 'Av. Siempre Viva 742' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Playa principal para unidades usadas' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
