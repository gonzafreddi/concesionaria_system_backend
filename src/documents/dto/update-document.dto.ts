import { PartialType } from '@nestjs/swagger';
import { CreateDocumentDto } from './create-document.dto';

/**
 * DTO para actualización parcial de documentos.
 */
export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {}
