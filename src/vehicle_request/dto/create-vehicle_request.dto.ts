import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsIn, IsString, IsNumber, IsInt, IsEnum } from 'class-validator';
import { RequestStatus } from '../entities/vehicle_request.entity';

export class CreateVehicleRequestDto {
  @ApiProperty()
  @IsInt()
  clientId: number;

  @ApiProperty()
  @IsInt()
  userId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsIn(['AUTO', 'MOTO'])
  type?: 'AUTO' | 'MOTO';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  yearFrom?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  yearTo?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  colorPreference?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ enum: RequestStatus, required: false })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;
}

