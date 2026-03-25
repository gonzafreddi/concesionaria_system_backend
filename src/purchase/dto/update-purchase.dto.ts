import { PartialType } from '@nestjs/swagger';
import { CreatePurchaseDto } from './create-purchase.dto';

/**
 * DTO para actualización parcial de compras.
 */
export class UpdatePurchaseDto extends PartialType(CreatePurchaseDto) {}
