import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class AttachQuoteDocumentDto {
  @ApiProperty({
    description: 'ID UUID del documento generado a asociar',
    example: '8d679f55-f0f3-4fd1-b784-d3a069d87d88',
  })
  @IsString()
  @IsUUID()
  documentId: string;
}
