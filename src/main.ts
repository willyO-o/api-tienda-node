import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Aplicar ValidationPipe globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Servir archivos estáticos para los avatares
  app.use(express.static(path.join(process.cwd(), 'uploads')));
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
