import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  it('should be defined', () => {
    expect(new HttpExceptionFilter()).toBeDefined();
  });

  it('logs and serializes http exceptions', () => {
    const filter = new HttpExceptionFilter();
    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          url: '/vehicles/36/images',
          originalUrl: '/vehicles/36/images',
        }),
        getResponse: () => ({
          status,
        }),
      }),
    };
    const exception = new HttpException(
      { message: 'Cloudinary no está configurado en el entorno actual' },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    filter.catch(exception, host as any);

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('POST /vehicles/36/images - 500'),
      expect.any(String),
    );
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Cloudinary no está configurado en el entorno actual',
      timestamp: expect.any(String),
      path: '/vehicles/36/images',
    });
    errorSpy.mockRestore();
  });

  it('logs and serializes unknown exceptions', () => {
    const filter = new HttpExceptionFilter();
    const errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          url: '/vehicles/36/images',
          originalUrl: '/vehicles/36/images',
        }),
        getResponse: () => ({
          status,
        }),
      }),
    };
    const exception = new Error('fallo inesperado');

    filter.catch(exception, host as any);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'fallo inesperado',
      timestamp: expect.any(String),
      path: '/vehicles/36/images',
    });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
