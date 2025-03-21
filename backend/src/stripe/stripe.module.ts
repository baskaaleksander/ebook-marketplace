import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { WebhookService } from './webhook.service';
import { PrismaService } from 'src/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { OrderService } from './order.service';

@Module({
  imports: [ConfigModule],
  controllers: [StripeController],
  providers: [StripeService, WebhookService, PrismaService, OrderService],
  exports: [StripeService]
})
export class StripeModule {}