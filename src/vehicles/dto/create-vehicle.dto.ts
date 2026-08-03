import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import {
  VehicleEntryType,
  VehicleStatus,
  VehicleType,
} from '../entities/vehicle.entity';

export class CreateVehicleDto {
  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType)
  type: VehicleType;

  @ApiProperty()
  @IsString()
  brand: string;

  @ApiProperty()
  @IsString()
  model: string;

  @ApiProperty()
  @IsInt()
  year: number;

  @ApiProperty()
  @IsString()
  color: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  mileage?: number;

  @ApiProperty({ enum: VehicleStatus, required: false })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiProperty({ enum: VehicleEntryType, required: false })
  @IsOptional()
  @IsEnum(VehicleEntryType)
  entryType?: VehicleEntryType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  technicalSpecifications?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  acquisitionPrice?: number;

  @ApiProperty({ required: false, example: '2026-03-03' })
  @IsOptional()
  @IsDateString()
  entryDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  characteristics?: string;

  @ApiProperty({ required: true })
  @IsString()
  vehiclePlate: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsInt()
  ownerClientId?: number | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsInt()
  @IsPositive()
  locationId?: number | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  acquisitionTypeId?: number;
}
