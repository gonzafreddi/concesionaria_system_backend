import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { QuoteActivityType } from '../entities/quote-activity.entity';

export class CreateQuoteActivityDto {
  @IsEnum(QuoteActivityType)
  type: QuoteActivityType;

  @IsString()
  @MaxLength(180)
  title: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  dueAt?: string | null;

  @IsOptional()
  @IsString()
  completedAt?: string | null;

  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : null))
  @IsInt()
  @Min(1)
  createdById?: number | null;
}
