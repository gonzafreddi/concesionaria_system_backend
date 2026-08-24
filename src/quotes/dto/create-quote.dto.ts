import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { QuoteStatus } from '../entities/quote.entity';

export class CreateQuoteDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  clientId: number;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  vehicleId: number;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  @IsInt()
  @Min(1)
  userId?: number | null;

  @Transform(({ value }) => Number(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  quotedPrice: number;

  @IsOptional()
  @IsString()
  validUntil?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  paymentMethod?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null || value === undefined
      ? null
      : Number(value),
  )
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  downPayment?: number | null;

  @IsOptional()
  @IsString()
  financingDetails?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsOptional()
  @IsString()
  nextFollowUpAt?: string | null;

  @IsOptional()
  @IsString()
  lostReason?: string | null;

  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;
}
