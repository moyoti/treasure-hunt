import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for mobile and web clients
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Set global prefix
  app.setGlobalPrefix('api');
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  
  await app.listen(port);
  console.log(`🚀 Treasure Hunt API running on port ${port}`);
}

bootstrap();