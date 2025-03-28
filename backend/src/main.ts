import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { json } from 'express';

async function bootstrap() {

  const app = await NestFactory.create(AppModule,
    {
      rawBody: true,
    }
  );
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
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
