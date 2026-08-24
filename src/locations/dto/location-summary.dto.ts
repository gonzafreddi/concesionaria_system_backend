import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocationType } from '../entities/location.entity';

export class LocationSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Deposito Central' })
  name: string;

  @ApiProperty({ enum: LocationType, example: LocationType.DEPOSIT })
  type: LocationType;

  @ApiPropertyOptional({ example: 'Av. Siempre Viva 742', nullable: true })
  address: string | null;
}
