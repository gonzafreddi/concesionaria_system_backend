import { PartialType } from '@nestjs/swagger';
import { CreatePreSaleDto } from './create-pre_sale.dto';

export class UpdatePreSaleDto extends PartialType(CreatePreSaleDto) {}
