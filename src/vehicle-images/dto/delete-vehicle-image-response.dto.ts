import { ApiProperty } from '@nestjs/swagger';

export class DeleteVehicleImageResponseDto {
  @ApiProperty({ example: 'Imagen eliminada correctamente' })
  message: string;
}
