import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendTestMailDto {
  @ApiProperty({
    description: 'Email destinatario para validar la configuracion SMTP',
    example: 'cliente@example.com',
  })
  @IsEmail()
  to: string;
}
