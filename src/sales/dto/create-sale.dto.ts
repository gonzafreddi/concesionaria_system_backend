import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsInt, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateSaleDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  quoteId?: number;

  @ApiProperty()
  @IsInt()
  clientId: number;

  @ApiProperty()
  @IsInt()
  vehicleId: number;

  @ApiProperty()
  @IsInt()
  userId: number;

  @ApiProperty()
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ type: String })
  @IsDateString()
  saleDate: string;
}

