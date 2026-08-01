import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class NotifyVehicleArrivalDto {
  @ApiProperty({
    description: 'ID del vehiculo ingresado que coincide con la solicitud',
    example: 12,
  })
  @IsInt()
  vehicleId: number;
}
