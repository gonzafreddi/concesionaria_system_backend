import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsInt,
} from 'class-validator';
import { VehicleType, VehicleStatus } from '../entities/vehicle.entity';

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  technicalSpecifications?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  acquisitionPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  characteristics?: string;

  @ApiProperty({ required: true })
  @IsString()
  vehiclePlate: string;

  @ApiProperty({ required: false })
  @IsInt()
  acquisitionTypeId: number;
}
