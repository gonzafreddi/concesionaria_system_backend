import { PartialType } from '@nestjs/swagger';
import { CreatePreSaleBodyworkDto } from './create-pre-sale-bodywork.dto';

export class UpdatePreSaleBodyworkDto extends PartialType(CreatePreSaleBodyworkDto) {}
