import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  
  // Enable global validation pipe to automatically validate incoming request data
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(configService.get<number>('PORT', 3000));
}
bootstrap();
