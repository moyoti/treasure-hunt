import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('开始启动应用...');
  
  const app = await NestFactory.create(AppModule);
  console.log('Nest应用创建成功');
  
  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });
  console.log('CORS已启用');
  
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
  console.log('API前缀已设置');
  
  const port = process.env.PORT || 3000;
  console.log(`准备监听端口: ${port}`);
  
  await app.listen(port);
  console.log(`✅ Treasure Hunt API running on port ${port}`);
  console.log(`✅ API地址: http://localhost:${port}/api`);
}

bootstrap().catch(err => {
  console.error('启动失败:', err);
  process.exit(1);
});