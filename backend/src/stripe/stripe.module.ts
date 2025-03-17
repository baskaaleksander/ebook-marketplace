import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { WebhookService } from './webhook.service';
import { PrismaService } from 'src/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [StripeController],
  providers: [StripeService, WebhookService, PrismaService],
  exports: [StripeService]
})
export class StripeModule {}