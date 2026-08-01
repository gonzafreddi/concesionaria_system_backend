import { InternalServerErrorException } from '@nestjs/common';
import { Resend } from 'resend';
import { MailService } from './mail.service';

jest.mock('resend');

describe('MailService', () => {
  let service: MailService;
  const originalEnv = process.env;
  const sendMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };
    (Resend as jest.Mock).mockImplementation(() => ({
      emails: {
        send: sendMock,
      },
    }));
    sendMock.mockResolvedValue({ data: { id: 'email-id' }, error: null });
    service = new MailService();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('does not send when mail is disabled', async () => {
    process.env.MAIL_ENABLED = 'false';

    const sent = await service.sendMail({
      to: 'cliente@example.com',
      subject: 'Test',
      text: 'Body',
    });

    expect(sent).toBe(false);
    expect(Resend).not.toHaveBeenCalled();
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('sends email through Resend when mail is enabled', async () => {
    process.env.MAIL_ENABLED = 'true';
    process.env.RESEND_API_KEY = 're_test';
    process.env.RESEND_FROM_EMAIL = 'Concesionaria <no-reply@example.com>';

    const sent = await service.sendMail({
      to: 'cliente@example.com',
      subject: 'Test',
      text: 'Body',
    });

    expect(sent).toBe(true);
    expect(Resend).toHaveBeenCalledWith('re_test');
    expect(sendMock).toHaveBeenCalledWith({
      from: 'Concesionaria <no-reply@example.com>',
      to: 'cliente@example.com',
      subject: 'Test',
      text: 'Body',
    });
  });

  it('throws on test email when enabled and Resend fails', async () => {
    process.env.MAIL_ENABLED = 'true';
    process.env.RESEND_API_KEY = 're_test';
    process.env.RESEND_FROM_EMAIL = 'Concesionaria <no-reply@example.com>';
    sendMock.mockResolvedValue({ data: null, error: { message: 'Invalid' } });

    await expect(
      service.sendTestEmail('cliente@example.com'),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
