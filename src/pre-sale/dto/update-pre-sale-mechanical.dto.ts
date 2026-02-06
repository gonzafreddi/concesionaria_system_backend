import { PartialType } from '@nestjs/swagger';
import { CreatePreSaleMechanicalDto } from './create-pre-sale-mechanical.dto';

export class UpdatePreSaleMechanicalDto extends PartialType(CreatePreSaleMechanicalDto) {}
