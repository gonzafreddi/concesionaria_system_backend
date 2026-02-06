import { PartialType } from '@nestjs/swagger';
import { CreatePreSaleDto } from './create-pre-sale.dto';

export class UpdatePreSaleDto extends PartialType(CreatePreSaleDto) {}

import { CreatePreSaleMechanicalDto } from './create-pre-sale-mechanical.dto';

export class UpdatePreSaleMechanicalDto extends PartialType(
  CreatePreSaleMechanicalDto,
) {}

import { CreatePreSaleAestheticDto } from './create-pre-sale-aesthetic.dto';

export class UpdatePreSaleAestheticDto extends PartialType(
  CreatePreSaleAestheticDto,
) {}

import { CreatePreSaleDocumentationDto } from './create-pre-sale-documentation.dto';

export class UpdatePreSaleDocumentationDto extends PartialType(
  CreatePreSaleDocumentationDto,
) {}
