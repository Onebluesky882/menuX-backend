import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://menu-x-five.vercel.app/',
      'http://localhost:3001',
    ],
    credentials: true,
  });
  Logger.log('Application started...');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
