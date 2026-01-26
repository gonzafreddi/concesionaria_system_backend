import {
  IsNumber,
  IsBoolean,
  IsDate,
  IsOptional,
  Min,
  Max,
  IsDecimal,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateInspectionDto {
  // Relaciones
  @ApiProperty({
    description: 'ID del cliente',
    example: 1,
    type: Number,
  })
  @IsNumber()
  clientId: number;

  @ApiProperty({
    description: 'ID del vehículo',
    example: 1,
    type: Number,
  })
  @IsNumber()
  vehicleId: number;

  // Estado General
  @ApiProperty({
    description: 'Puntuación de pintura y chapa (1 a 10)',
    example: 8,
    type: Number,
    minimum: 1,
    maximum: 10,
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  paintAndBody: number;

  @ApiProperty({
    description: 'Porcentaje de cubiertas (0 a 100)',
    example: 85,
    type: Number,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  tiresPercentage: number;

  @ApiProperty({
    description: 'Marca de cubiertas',
    example: 'Michelin',
    type: String,
  })
  @IsString()
  tiresBrand: string;

  @ApiProperty({
    description: 'Puntuación de condición interior (1 a 10)',
    example: 7,
    type: Number,
    minimum: 1,
    maximum: 10,
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  interiorCondition: number;

  @ApiPropertyOptional({
    description: 'Detalles visibles del vehículo',
    example: 'Cristales ligeramente rayados, moldura trasera con pequeño golpe',
    type: String,
  })
  @IsOptional()
  @IsString()
  visibleDetails?: string;

  // Condición mecánica / legal
  @ApiPropertyOptional({
    description: 'Funciona todo correctamente',
    example: true,
    type: Boolean,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  fullyOperational?: boolean;

  @ApiPropertyOptional({
    description: 'Servicio al día',
    example: false,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  serviceUpToDate?: boolean;

  @ApiPropertyOptional({
    description: 'Es titular del vehículo',
    example: true,
    type: Boolean,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isOwner?: boolean;

  @ApiPropertyOptional({
    description: 'Tiene deuda de patente',
    example: false,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasLicenseDebt?: boolean;

  @ApiPropertyOptional({
    description: 'Monto de deuda de patente',
    example: 0,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  licenseDebtAmount?: number;

  // Documentación a entregar
  @ApiPropertyOptional({
    description: 'Cédula del vehículo',
    example: true,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  docRegistrationCard?: boolean;

  @ApiPropertyOptional({
    description: 'Título del vehículo',
    example: true,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  docTitle?: boolean;

  @ApiPropertyOptional({
    description: 'VTV vigente',
    example: true,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  docVtv?: boolean;

  @ApiPropertyOptional({
    description: 'DNI del titular',
    example: true,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  docOwnerId?: boolean;

  @ApiPropertyOptional({
    description: 'Formulario 08',
    example: true,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  docForm08?: boolean;

  @ApiPropertyOptional({
    description: 'Libre deuda de patentes',
    example: true,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  docNoDebtCertificate?: boolean;

  @ApiPropertyOptional({
    description: 'Verificación policial',
    example: true,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  docPoliceVerification?: boolean;

  @ApiPropertyOptional({
    description: 'Informe de dominio',
    example: true,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  docDomainReport?: boolean;

  // Evaluación comercial
  @ApiProperty({
    description: 'Valor estimado de mercado',
    example: 450000.5,
    type: Number,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  estimatedMarketValue: number;

  @ApiProperty({
    description: 'Valor de toma o compra',
    example: 420000.0,
    type: Number,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  tradeInValue: number;

  @ApiPropertyOptional({
    description: 'Fecha estimada de ingreso al inventario',
    example: '2026-02-01',
    type: String,
    format: 'date',
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  estimatedEntryDate?: Date;

  // Observaciones
  @ApiPropertyOptional({
    description: 'Observaciones generales de la inspección',
    example:
      'Vehículo en buen estado general, necesita lavar y revisar fluidos',
    type: String,
  })
  @IsOptional()
  @IsString()
  generalNotes?: string;

  @ApiPropertyOptional({
    description: 'Observaciones sobre pintura y paños a retocar',
    example:
      'Retoque menor en parachoques trasero, reparación de rayadura en puerta izquierda',
    type: String,
  })
  @IsOptional()
  @IsString()
  paintNotes?: string;
}
