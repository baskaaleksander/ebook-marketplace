import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../prisma.service';
import { ConfigModule } from '@nestjs/config';
import { OrderService } from './order.service';
import { FeaturedService } from './featured.service';

@Module({
  imports: [ConfigModule],
  controllers: [StripeController],
  providers: [StripeService, WebhookService, PrismaService, OrderService, FeaturedService],
  exports: [StripeService, WebhookService, OrderService, FeaturedService]
})
export class StripeModule {}