import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  // Enable global validation pipe to automatically validate incoming request data
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(configService.get<number>('PORT', 3000));
}
bootstrap();
