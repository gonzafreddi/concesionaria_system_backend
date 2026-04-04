import { ApiProperty } from '@nestjs/swagger';
import { VehicleStatus, VehicleType } from '../entities/vehicle.entity';

export class VehicleSaleOptionDto {
  @ApiProperty({ example: 12 })
  id: number;

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

  @ApiProperty({ example: 24500000 })
  price: number;

  @ApiProperty({ enum: VehicleStatus, example: VehicleStatus.AVAILABLE })
  status: VehicleStatus;
}
