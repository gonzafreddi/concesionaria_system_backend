import { PartialType } from '@nestjs/swagger';
import { CreateInspectionDto } from './create-inspection.dto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para actualizar inspecciones
 * Todos los campos son opcionales, permitiendo actualizaciones parciales
 */
export class UpdateInspectionDto extends PartialType(CreateInspectionDto) {
  @ApiProperty({
    description: 'Todos los campos heredados de CreateInspectionDto son opcionales para actualización',
  })
  readonly _updateNote?: string;
}
