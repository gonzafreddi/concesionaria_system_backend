import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/**
 * DTO para que un usuario autenticado cambie su propia contraseña
 */
export class ChangePasswordDto {
  @ApiProperty({
    description: 'Contraseña actual',
    example: 'MiPasswordActual123!',
    minLength: 6,
  })
  @IsString({ message: 'La contraseña actual debe ser una cadena de texto' })
  @MinLength(6, {
    message: 'La contraseña actual debe tener al menos 6 caracteres',
  })
  oldPassword: string;

  @ApiProperty({
    description: 'Nueva contraseña',
    example: 'MiNuevaPassword123!',
    minLength: 8,
  })
  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
  @MinLength(8, {
    message: 'La nueva contraseña debe tener al menos 8 caracteres',
  })
  newPassword: string;
}
