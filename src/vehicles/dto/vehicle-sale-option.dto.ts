import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  VehicleCategory,
  VehicleEntryType,
  VehicleStatus,
  VehicleType,
} from '../entities/vehicle.entity';

export class VehicleSaleOptionDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({ enum: VehicleCategory, example: VehicleCategory.CAR })
  category: VehicleCategory;

  @ApiProperty({ enum: VehicleType, example: VehicleType.USED })
  type: VehicleType;

  @ApiProperty({ example: 'Toyota' })
  brand: string;

  @ApiProperty({ example: 'Corolla' })
  model: string;

  @ApiProperty({ example: 2021 })
  year: number;

  @ApiProperty({ example: 'Blanco' })
  color: string;

  @ApiProperty({ example: 'AB123CD' })
  vehiclePlate: string;
  @ApiPropertyOptional({ example: '9BWZZZ377VT004251', nullable: true })
  chassisNumber: string | null;

  @ApiPropertyOptional({ example: 'CFZ123456', nullable: true })
  engineNumber: string | null;

  @ApiProperty({ example: 24500000 })
  price: number;

  @ApiPropertyOptional({ example: 87500, nullable: true })
  mileage: number | null;

  @ApiPropertyOptional({
    example: 'Motor 1.6, caja manual, 6 airbags, ABS.',
    nullable: true,
  })
  technicalSpecifications: string | null;

  @ApiProperty({ enum: VehicleStatus, example: VehicleStatus.AVAILABLE })
  status: VehicleStatus;

  @ApiProperty({
    enum: VehicleEntryType,
    example: VehicleEntryType.DIRECT_PURCHASE,
  })
  entryType: VehicleEntryType;

  @ApiProperty({ example: 15, nullable: true, required: false })
  ownerClientId: number | null;

  @ApiPropertyOptional({ example: 1, nullable: true })
  locationId: number | null;

  @ApiProperty({ example: 20000000, nullable: false })
  aquisitionPrice: number;
}
