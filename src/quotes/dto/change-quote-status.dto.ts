import { IsEnum, IsOptional, IsString } from 'class-validator';
import { QuoteStatus } from '../entities/quote.entity';

export class ChangeQuoteStatusDto {
  @IsEnum(QuoteStatus)
  status: QuoteStatus;

  @IsOptional()
  @IsString()
  lostReason?: string | null;

  @IsOptional()
  @IsString()
  note?: string | null;
}
