import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://menu-x-five.vercel.app',
      'https://menu-x-frontend-git-main-onebluesky882outlookcoms-projects.vercel.app',
      'https://menu-x-frontend-9k4gkkwgx-onebluesky882outlookcoms-projects.vercel.app',
    ],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    exposedHeaders: ['Set-Cookie'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
