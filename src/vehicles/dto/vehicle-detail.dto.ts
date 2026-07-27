import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  VehicleEntryType,
  VehicleStatus,
  VehicleType,
} from '../entities/vehicle.entity';
import { VehicleImageSummaryDto } from './vehicle-image-summary.dto';

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
    example: 87500,
    nullable: true,
  })
  mileage: number | null;

  @ApiPropertyOptional({
    example: 'Motor 1.6, caja manual, 6 airbags, ABS.',
    nullable: true,
  })
  technicalSpecifications: string | null;

  @ApiPropertyOptional({
    example: '2026-03-24T15:30:00.000Z',
    nullable: true,
  })
  purchaseDate: string | null;

  @ApiProperty({ enum: VehicleStatus, example: VehicleStatus.AVAILABLE })
  status: VehicleStatus;

  @ApiProperty({
    enum: VehicleEntryType,
    example: VehicleEntryType.DIRECT_PURCHASE,
  })
  entryType: VehicleEntryType;

  @ApiPropertyOptional({ example: 15, nullable: true })
  ownerClientId: number | null;

  @ApiProperty({
    type: VehicleImageSummaryDto,
    isArray: true,
    example: [],
  })
  images: VehicleImageSummaryDto[];
}
