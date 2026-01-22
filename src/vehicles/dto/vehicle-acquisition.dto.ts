import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VehicleAcquisitionDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  active: boolean;
}

export class CreateVehicleAcquisitionDto {
  @ApiProperty()
  @IsString()
  name: string;
}
