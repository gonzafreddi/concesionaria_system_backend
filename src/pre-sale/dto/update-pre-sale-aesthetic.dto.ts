import { PartialType } from '@nestjs/swagger';
import { CreatePreSaleAestheticDto } from './create-pre-sale-aesthetic.dto';

export class UpdatePreSaleAestheticDto extends PartialType(CreatePreSaleAestheticDto) {}
