import { PartialType } from '@nestjs/swagger';
import { CreatePreSaleDocumentationDto } from './create-pre-sale-documentation.dto';

export class UpdatePreSaleDocumentationDto extends PartialType(CreatePreSaleDocumentationDto) {}
