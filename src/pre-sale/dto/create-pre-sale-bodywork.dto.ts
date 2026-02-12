import { IsBoolean, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePreSaleBodyworkDto {
  @ApiProperty({
    description: 'General paint inspection completed',
    example: true,
  })
  @IsBoolean()
  generalPaintInspection: boolean;

  @ApiProperty({ description: 'Bumper touch up completed', example: false })
  @IsBoolean()
  bumperTouchUp: boolean;

  @ApiProperty({ description: 'Optics polishing completed', example: true })
  @IsBoolean()
  opticsPolished: boolean;

  @ApiProperty({ description: 'Minor dent repair completed', example: true })
  @IsBoolean()
  minorDentRepair: boolean;

  @ApiProperty({ description: 'Final polish completed', example: true })
  @IsBoolean()
  finalPolish: boolean;
  @ApiProperty({
    description: 'Indicates if the process is completed',
    example: false,
  })
  @IsBoolean()
  completed: boolean;

  @ApiProperty({
    description: 'Additional observations',
    example: 'Paint condition excellent, no scratches',
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
