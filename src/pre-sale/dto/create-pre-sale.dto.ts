import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreatePreSaleDto {
  @ApiProperty()
  @IsInt()
  @IsPositive()
  vehicleId: number;
}
