import { PartialType } from '@nestjs/swagger';
import { CreateQuoteActivityDto } from './create-quote-activity.dto';

export class UpdateQuoteActivityDto extends PartialType(
  CreateQuoteActivityDto,
) {}
