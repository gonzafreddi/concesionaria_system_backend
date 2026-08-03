import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class MoveVehicleLocationDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  locationId: number;

  @ApiProperty({ example: 'Traslado a showroom para exhibicion' })
  @IsString()
  @MaxLength(500)
  reason: string;

  @ApiPropertyOptional({
    description: 'Fallback para auditoria cuando no hay JWT en request.user',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  userId?: number;
}
