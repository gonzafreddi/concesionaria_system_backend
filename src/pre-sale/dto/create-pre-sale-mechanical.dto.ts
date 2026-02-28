import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PreSaleStatus } from '../entities/pre-sale-status.enum';

export class CreatePreSaleMechanicalDto {
  @ApiProperty({
    description: 'Oil and filter change completed',
    example: true,
  })
  @IsBoolean()
  oilAndFilterChange: boolean;

  @ApiProperty({ description: 'Air filter check completed', example: true })
  @IsBoolean()
  airFilter: boolean;

  @ApiProperty({ description: 'Fuel filter check completed', example: false })
  @IsBoolean()
  fuelFilter: boolean;

  @ApiProperty({ description: 'Cabin filter check completed', example: true })
  @IsBoolean()
  cabinFilter: boolean;

  @ApiProperty({ description: 'Brake system check completed', example: true })
  @IsBoolean()
  brakeCheck: boolean;

  @ApiProperty({ description: 'Suspension check completed', example: true })
  @IsBoolean()
  suspensionCheck: boolean;

  @ApiProperty({
    description: 'Steering system check completed',
    example: false,
  })
  @IsBoolean()
  steeringCheck: boolean;

  @ApiProperty({ description: 'Drivetrain check completed', example: true })
  @IsBoolean()
  drivetrainCheck: boolean;

  @ApiProperty({ description: 'Exhaust system check completed', example: true })
  @IsBoolean()
  exhaustCheck: boolean;

  @ApiProperty({ description: 'Timing belt check completed', example: false })
  @IsBoolean()
  timingBeltCheck: boolean;

  @ApiProperty({ description: 'Clutch check completed', example: true })
  @IsBoolean()
  clutchCheck: boolean;

  @ApiProperty({ description: 'Battery check completed', example: true })
  @IsBoolean()
  batteryCheck: boolean;

  @ApiProperty({
    description: 'Lights and horn check completed',
    example: true,
  })
  @IsBoolean()
  lightsAndHorn: boolean;

  @ApiProperty({ description: 'Tires check completed', example: true })
  @IsBoolean()
  tiresCheck: boolean;

  @ApiProperty({
    description: 'Alignment and balancing check completed',
    example: false,
  })
  @IsBoolean()
  alignmentAndBalancing: boolean;

  @ApiProperty({ description: 'Fluid levels check completed', example: true })
  @IsBoolean()
  fluidLevelsCheck: boolean;

  @ApiProperty({
    description: 'Road test and diagnostics completed',
    example: true,
  })
  @IsBoolean()
  roadTestAndDiagnostics: boolean;

  @ApiProperty({
    description: 'Indicates if the process is completed',
    example: false,
  })
  @IsBoolean()
  completed: boolean;

  @ApiPropertyOptional({
    description: 'Checklist status',
    enum: PreSaleStatus,
    example: PreSaleStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(PreSaleStatus)
  status?: PreSaleStatus;

  @ApiProperty({
    description: 'Additional observations',
    example: 'Engine runs smoothly, no issues detected',
    required: false,
  })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty({
    description: 'Vehicle ID to associate with this inspection',
    example: 123,
  })
  @IsNumber()
  vehicleId: number;
}
