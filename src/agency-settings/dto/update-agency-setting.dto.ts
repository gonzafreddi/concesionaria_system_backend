import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateAgencySettingDto {
  @ApiPropertyOptional({ nullable: true, example: 'AUTO3 S.A.' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  legalName?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'AUTO3 Centro Multimarcas',
  })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  tradeName?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '30-12345678-9' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  taxId?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Av. Siempre Viva 742' })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Rosario' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Santa Fe' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  province?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '+54 341 555-1234' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  phone?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'ventas@auto3.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Juan Perez' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  representativeName?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '12345678' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  representativeDocument?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'https://cdn.auto3.com/logo.png',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'Responsable Inscripto' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  taxCondition?: string | null;

  @ApiPropertyOptional({ nullable: true, example: '2000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'https://auto3.com' })
  @IsOptional()
  @IsString()
  website?: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 200000,
    description: 'Monto por rescision anticipada de consignacion',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? null
      : Number(value),
  )
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  consignmentEarlyTerminationFee?: number | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 3.5,
    description: 'Porcentaje usado para estimar el costo de transferencia',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? null
      : Number(value),
  )
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  transferPercentage?: number | null;
}
