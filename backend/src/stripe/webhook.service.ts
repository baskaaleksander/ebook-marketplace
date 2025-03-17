import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
    private stripe: Stripe;
  constructor(
    private prismaService: PrismaService,
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
      case 'payment_intent.created':
        await this.handlePaymentIntentCreated(event);
        break;
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event);
        break;
    //   case 'account.updated':
    //     await this.handleAccountUpdated(event);
    //     break;
      case 'payout.created':
        await this.handlePayoutCreated(event);
        break;
    }

    await this.prismaService.webhookEvent.updateMany({
      where: {
        eventType: event.type,
        payload: { path: ['id'], equals: event.id },
        processed: false,
      },
      data: {
        processed: true,
      },
    });
  }

  private async handlePaymentIntentCreated(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    const { orderId, productId, buyerId } = paymentIntent.metadata || {};
    
    if (!orderId || !productId || !buyerId) {
      console.log('Missing required metadata in payment intent', paymentIntent.id);
      return;
    }
    
    try {
      const product = await this.prismaService.product.findUnique({
        where: { id: productId },
        include: { seller: true },
      });
      
      if (!product) {
        console.log(`Product ${productId} not found`);
        return;
      }
      
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'pln',
              product_data: {
                name: product.title,
                description: product.description || 'E-book purchase',
              },
              unit_amount: Math.round(product.price * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${this.configService.get<string>('FRONTEND_URL')}/stripe/success?session_id={CHECKOUT_SESSION_ID}&orderId=${orderId}`,
        cancel_url: `${this.configService.get<string>('FRONTEND_URL')}/stripe/cancel?orderId=${orderId}`,
        client_reference_id: orderId,
        metadata: {
          orderId,
          productId,
          buyerId,
          payment_intent_id: paymentIntent.id,
        },
      });
      
      await this.prismaService.order.update({
        where: { id: orderId },
        data: {
          checkoutSessionId: session.id,
          paymentUrl: session.url,
        },
      });
      
      console.log(`Created checkout session ${session.id} for order ${orderId}`);
      
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  }
  
  private async handlePaymentIntentSucceeded(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    // Extract metadata
    const { orderId, productId, buyerId } = paymentIntent.metadata;
    
    await this.prismaService.order.update({
      where: { id: orderId },
      data: { status: 'COMPLETED' },
    });

    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    });

    if (order) {
      await this.prismaService.user.update({
        where: { id: order.product.sellerId },
        data: { balance: { increment: order.amount * 0.9 } }, 
      });
    }
  }

//   private async handleAccountUpdated(event: Stripe.Event) {
//     const account = event.data.object as Stripe.Account;
    

//     await this.prismaService.user.updateMany({
//       where: { stripeAccount: account.id },
//       data: {
//         // You could add fields to track account status if needed
//         // e.g., stripeAccountVerified: account.charges_enabled
//       },
//     });
//   }

  private async handlePayoutCreated(event: Stripe.Event) {
    const payout = event.data.object as Stripe.Payout;
    
    const user = await this.prismaService.user.findFirst({
      where: { stripeAccount: payout.destination as string },
    });

    if (user) {
      await this.prismaService.wallet.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          lastPayout: new Date(),
        },
        update: {
          lastPayout: new Date(),
        },
      });
    }
  }
}