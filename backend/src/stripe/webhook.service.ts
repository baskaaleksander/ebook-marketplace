import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
    private stripe: Stripe;
  constructor(
    private configService: ConfigService,
) {
    const stripeKey = configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-02-24.acacia',
    });
}

  async processWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
    //   case 'payment_intent.created':
    //     await this.handlePaymentIntentCreated(event);
    //     break;
    //   case 'payment_intent.succeeded':
    //     await this.handlePaymentIntentSucceeded(event);
    //     break;
    // //   case 'account.updated':
    // //     await this.handleAccountUpdated(event);
    // //     break;
    //   case 'payout.created':
    //     await this.handlePayoutCreated(event);
    //     break;
    }

    }
}