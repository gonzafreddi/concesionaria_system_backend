import { IsBoolean, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePreSaleAestheticDto {
  @ApiProperty({ description: 'Exterior wash completed', example: true })
  @IsBoolean()
  exteriorWash: boolean;

  @ApiProperty({ description: 'Engine wash completed', example: true })
  @IsBoolean()
  engineWash: boolean;

  @ApiProperty({ description: 'Interior cleaning completed', example: true })
  @IsBoolean()
  interiorCleaning: boolean;

  @ApiProperty({ description: 'Upholstery cleaning completed', example: false })
  @IsBoolean()
  upholsteryCleaning: boolean;

  @ApiProperty({ description: 'Glass cleaning completed', example: true })
  @IsBoolean()
  glassCleaning: boolean;

  @ApiProperty({
    description: 'Interior plastics treatment completed',
    example: true,
  })
  @IsBoolean()
  interiorPlastics: boolean;

  @ApiProperty({ description: 'Polishing and waxing completed', example: true })
  @IsBoolean()
  polishingAndWaxing: boolean;

  @ApiProperty({ description: 'Detailing completed', example: false })
  @IsBoolean()
  detailing: boolean;

  @ApiProperty({
    description: 'Badges and accessories installed',
    example: true,
  })
  @IsBoolean()
  badgesAndAccessories: boolean;

  @ApiProperty({ description: 'License plate installed', example: true })
  @IsBoolean()
  licensePlateInstall: boolean;

  @ApiProperty({
    description: 'Additional observations',
    example: 'Vehicle looks pristine, ready for sale',
    required: false,
  })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiProperty({
    description: 'Vehicle ID to associate with this inspection',
    example: 123,
  })
  @ApiProperty({
    description: 'Indicates if the process is completed',
    example: false,
  })
  @IsBoolean()
  completed: boolean;
  @IsNumber()
  vehicleId: number;
}
