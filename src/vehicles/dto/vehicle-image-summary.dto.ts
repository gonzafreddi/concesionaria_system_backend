import { ApiProperty } from '@nestjs/swagger';

export class VehicleImageSummaryDto {
  @ApiProperty({ example: 31 })
  id: number;

  @ApiProperty({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1710000000/concesionaria/vehicles/12/front.jpg',
  })
  url: string;

  @ApiProperty({ example: 'concesionaria/vehicles/12/abc123' })
  publicId: string;

  @ApiProperty({ example: true })
  isCover: boolean;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ example: '2026-04-23T11:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-04-23T11:00:00.000Z' })
  updatedAt: Date;
}
