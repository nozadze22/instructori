import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Api-Build', '2026-11-05-instructor-join');
    next();
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const allowPlatformWildcards =
    process.env.CORS_ALLOW_PLATFORM_WILDCARDS === '1' ||
    process.env.NODE_ENV !== 'production';

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      if (
        allowPlatformWildcards &&
        (origin.endsWith('.vercel.app') || origin.endsWith('.fly.dev'))
      ) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  });

  const port = Number(process.env.PORT ?? 4001);
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
