import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { json } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiKeyGuard } from './guards/api-key.guard';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule,
    {
      rawBody: true,
    }
  );

  const configService = app.get(ConfigService);

  app.use(cookieParser());

  app.use(
    json({
      verify: (req: any, res, buf) => {
        if (req.url.startsWith('/stripe/webhook')) {
          req.rawBody = buf;
        }
        return true;
      },
    }),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const uploadsPath = join(__dirname, '..', 'uploads');
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  }, express.static(uploadsPath));

  app.useGlobalGuards(new ApiKeyGuard(configService));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
