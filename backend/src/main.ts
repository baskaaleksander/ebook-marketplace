import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { json } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiKeyGuard } from './guards/api-key.guard';

async function bootstrap() {

  const app = await NestFactory.create(AppModule,
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

  app.useGlobalGuards(new ApiKeyGuard(configService));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
