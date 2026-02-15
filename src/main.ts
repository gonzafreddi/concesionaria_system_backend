import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: true,
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Concesionaria API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port = Number(process.env.PORT) || 3001;
  console.log(`Starting Nest application on port ${port}`);
  await app.listen(port, '0.0.0.0');
  console.log(`Nest application started and listening on port ${port}`);
}
bootstrap();
