import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './http-exception/http-exception.filter';
import { parsePort, validateRequiredEnvironment } from './config/environment';

async function bootstrap() {
  validateRequiredEnvironment();
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];
  const enableSwagger = process.env.ENABLE_SWAGGER === 'true';

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    credentials: true,
  });

  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('Concesionaria API')
      .setDescription('API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = process.env.PORT ? parsePort(process.env.PORT) : 3001;
  logger.log(`Starting Nest application on port ${port}`);
  await app.listen(port, '0.0.0.0');
  logger.log(`Nest application started and listening on port ${port}`);
}
void bootstrap();
