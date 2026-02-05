import { PartialType } from '@nestjs/swagger';
import { CreatePreSaleDto } from './create-pre-sale.dto';

export class UpdatePreSaleDto extends PartialType(CreatePreSaleDto) {}
