import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  const configuredOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const localDevelopmentOrigin = /^http:\/\/(?:localhost|127(?:\.\d{1,3}){3}|10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}):5173$/;

  app.enableCors({
    origin: (origin, callback) => {
      const isAllowed = !origin
        || configuredOrigins.includes(origin)
        || (process.env.NODE_ENV !== 'production' && localDevelopmentOrigin.test(origin));
      callback(isAllowed ? null : new Error('Origin not allowed by CORS'), isAllowed);
    },
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new ApiExceptionFilter());
  const swagger = new DocumentBuilder()
    .setTitle('Patient Management API')
    .setDescription('Patient, billing and payment APIs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swagger));
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
