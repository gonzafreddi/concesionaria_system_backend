import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PreSaleStatus } from '../entities/pre-sale-status.enum';

export class CreatePreSaleDocumentationDto {
  @ApiProperty({
    description: 'VTV (Vehicle Safety Inspection) completed',
    example: true,
  })
  @IsBoolean()
  vtv: boolean;

  @ApiProperty({ description: 'Police verification completed', example: true })
  @IsBoolean()
  policeVerification: boolean;

  @ApiProperty({ description: 'Ownership report obtained', example: false })
  @IsBoolean()
  ownershipReport: boolean;

  @ApiProperty({ description: 'Title and ID verified', example: true })
  @IsBoolean()
  titleAndIdVerified: boolean;

  @ApiProperty({ description: 'Form 08 signed', example: true })
  @IsBoolean()
  form08Signed: boolean;

  @ApiProperty({ description: 'Insurance arranged', example: false })
  @IsBoolean()
  insuranceArranged: boolean;

  @ApiProperty({ description: 'CETA form completed', example: true })
  @IsBoolean()
  cetaForm: boolean;

  @ApiProperty({
    description: 'Fines and debts check completed',
    example: true,
  })
  @IsBoolean()
  finesAndDebtsCheck: boolean;

  @ApiProperty({
    description: 'Auto parts engraving completed',
    example: false,
  })
  @IsBoolean()
  autoPartsEngraving: boolean;

  @ApiProperty({ description: 'Manuals and keys verified', example: true })
  @IsBoolean()
  manualsAndKeys: boolean;

  @ApiProperty({
    description: 'Indicates if the process is completed',
    example: false,
  })
  @IsBoolean()
  completed: boolean;

  @ApiPropertyOptional({
    description: 'Checklist status',
    enum: PreSaleStatus,
    example: PreSaleStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(PreSaleStatus)
  status?: PreSaleStatus;

  @ApiProperty({
    description: 'Extra observations',
    example: 'All documents in order',
    required: false,
  })
  @IsOptional()
  @IsString()
  extraObservations?: string;

  @ApiProperty({
    description: 'Vehicle ID to associate with this inspection',
    example: 123,
  })
  @IsNumber()
  vehicleId: number;
}
