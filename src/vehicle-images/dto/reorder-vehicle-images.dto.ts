import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  ValidateNested,
} from 'class-validator';

export class ReorderVehicleImageItemDto {
  @ApiProperty({ example: 101 })
  @Type(() => Number)
  @IsInt()
  imageId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  order: number;
}

export class ReorderVehicleImagesDto {
  @ApiProperty({
    type: ReorderVehicleImageItemDto,
    isArray: true,
    example: [
      { imageId: 101, order: 1 },
      { imageId: 102, order: 2 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderVehicleImageItemDto)
  items: ReorderVehicleImageItemDto[];
}
