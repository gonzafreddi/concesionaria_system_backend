import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateExpenseCategoryDto {
  @ApiProperty({ example: 'Servicios' })
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: 'Luz, internet, agua y gastos fijos' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
