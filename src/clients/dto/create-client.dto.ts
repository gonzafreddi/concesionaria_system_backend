import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dni: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({
    description: 'Firma digital del cliente serializada como base64 o data URL',
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  signatureData?: string | null;

  @ApiPropertyOptional({
    description: 'Fecha ISO 8601 en la que el cliente realizó la firma digital',
    example: '2026-06-09T10:01:57.863Z',
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  signatureCreatedAt?: Date | null;
}
