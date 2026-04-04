import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleStatus, VehicleType } from '../entities/vehicle.entity';

export class VehicleDetailDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ enum: VehicleType, example: VehicleType.USED })
  type: VehicleType;

  @ApiProperty({ example: 'Toyota' })
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  model: string;

  @ApiProperty({ example: 'AB123CD' })
  vehiclePlate: string;

  @ApiProperty({ example: 2021 })
  year: number;

  @ApiProperty({ example: 'Blanco' })
  color: string;

  @ApiProperty({ example: 24500000 })
  price: number;

  @ApiPropertyOptional({
    example: 19800000,
    nullable: true,
  })
  acquisitionPrice: number | null;

  @ApiPropertyOptional({
    example: '2026-03-24T15:30:00.000Z',
    nullable: true,
  })
  purchaseDate: string | null;

  @ApiProperty({ enum: VehicleStatus, example: VehicleStatus.AVAILABLE })
  status: VehicleStatus;
}
