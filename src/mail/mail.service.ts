import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateEmailOptions, Resend } from 'resend';
import { getMailConfig } from '../config/environment';

type ResendContentEmailOptions = Extract<
  CreateEmailOptions,
  { template?: never }
>;

export type AppSendMailOptions = Omit<
  ResendContentEmailOptions,
  'from' | 'text'
> & {
  from?: string;
  text: string;
};

export type VehicleRequestMatchedEmail = {
  to: string;
  clientName?: string | null;
  requestedVehicle?: string | null;
  vehicle: {
    id: number;
    brand: string;
    model: string;
    year: number;
    color?: string | null;
    price?: number | string | null;
  };
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  isEnabled(): boolean {
    return getMailConfig().enabled;
  }

  async sendMail(options: AppSendMailOptions): Promise<boolean> {
    const config = getMailConfig();

    if (!config.enabled) {
      this.logger.debug(
        'Mail deshabilitado. Se omitio el envio a ' + String(options.to) + '.',
      );
      return false;
    }

    if (!config.apiKey) {
      this.logger.error('Mail habilitado pero falta RESEND_API_KEY.');
      return false;
    }

    try {
      const resend = new Resend(config.apiKey);
      const payload: ResendContentEmailOptions = {
        ...options,
        from: options.from || config.from,
      };
      const { error } = await resend.emails.send(payload);

      if (error) {
        this.logger.error(
          'Resend rechazo el envio a ' +
            String(options.to) +
            ': ' +
            this.formatError(error),
        );
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(
        'No se pudo enviar el mail a ' +
          String(options.to) +
          ': ' +
          this.formatError(error),
      );
      return false;
    }
  }

  async sendTestEmail(to: string): Promise<{ sent: boolean }> {
    const sent = await this.sendMail({
      to,
      subject: 'Prueba de envio - Concesionaria',
      text: 'El servicio de mails esta configurado correctamente.',
      html: '<p>El servicio de mails esta configurado correctamente.</p>',
    });

    if (this.isEnabled() && !sent) {
      throw new InternalServerErrorException(
        'No se pudo enviar el mail de prueba',
      );
    }

    return { sent };
  }

  async sendVehicleRequestMatchedEmail(
    data: VehicleRequestMatchedEmail,
  ): Promise<boolean> {
    const clientName = data.clientName?.trim() || 'cliente';
    const vehicleName = this.formatVehicleName(data.vehicle);
    const requestedVehicle = data.requestedVehicle?.trim();
    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');
    const vehicleUrl = frontendUrl
      ? frontendUrl + '/vehicles/' + data.vehicle.id
      : null;
    const price = this.formatPrice(data.vehicle.price);
    const requestedText = requestedVehicle
      ? ' que consultaste (' + requestedVehicle + ')'
      : ' que consultaste';

    const details: Array<[string, string]> = [
      ['Vehiculo', vehicleName],
      ['Color', data.vehicle.color],
      ['Precio', price],
    ].filter((detail): detail is [string, string] => Boolean(detail[1]));

    const detailsHtml = details
      .map(
        ([label, value]) =>
          '<li><strong>' +
          this.escapeHtml(label) +
          ':</strong> ' +
          this.escapeHtml(String(value)) +
          '</li>',
      )
      .join('');
    const vehicleLinkHtml = vehicleUrl
      ? '<p><a href="' + vehicleUrl + '">Ver vehiculo</a></p>'
      : '';

    return this.sendMail({
      to: data.to,
      subject: 'Ingreso el vehiculo que consultaste: ' + vehicleName,
      text: [
        'Hola ' + clientName + ',',
        '',
        'Te avisamos que ingreso un vehiculo' + requestedText + '.',
        'Vehiculo: ' + vehicleName,
        data.vehicle.color ? 'Color: ' + data.vehicle.color : null,
        price ? 'Precio: ' + price : null,
        vehicleUrl ? 'Link: ' + vehicleUrl : null,
        '',
        'Si te interesa, responde este mail o contactanos para coordinar los proximos pasos.',
      ]
        .filter(Boolean)
        .join('\n'),
      html:
        '<p>Hola ' +
        this.escapeHtml(clientName) +
        ',</p>' +
        '<p>Te avisamos que ingreso un vehiculo' +
        this.escapeHtml(requestedText) +
        '.</p>' +
        '<ul>' +
        detailsHtml +
        '</ul>' +
        vehicleLinkHtml +
        '<p>Si te interesa, responde este mail o contactanos para coordinar los proximos pasos.</p>',
    });
  }

  private formatVehicleName(vehicle: VehicleRequestMatchedEmail['vehicle']) {
    return [vehicle.brand, vehicle.model, vehicle.year]
      .filter(Boolean)
      .join(' ');
  }

  private formatPrice(
    price: number | string | null | undefined,
  ): string | null {
    if (price === null || price === undefined || price === '') {
      return null;
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice)) {
      return String(price);
    }

    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(numericPrice);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.stack || error.message;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }
}
