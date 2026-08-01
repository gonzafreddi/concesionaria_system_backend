import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SendTestMailDto } from './dto/send-test-mail.dto';
import { MailService } from './mail.service';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Enviar mail de prueba',
    description:
      'Valida la configuracion SMTP enviando un correo de prueba al destinatario indicado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado del intento de envio',
    example: {
      sent: true,
    },
  })
  @ApiResponse({
    status: 500,
    description: 'El servicio de mail esta habilitado pero fallo el envio',
  })
  sendTestEmail(@Body() sendTestMailDto: SendTestMailDto) {
    return this.mailService.sendTestEmail(sendTestMailDto.to);
  }
}
