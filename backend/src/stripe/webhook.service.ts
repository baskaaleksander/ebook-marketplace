import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sign } from 'crypto';
import { PrismaService } from 'src/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
    private stripe: Stripe;
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService
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
        case 'checkout.session.completed':
            this.handleCheckoutSessionCompleted(event);
            break;
        case 'payment_intent.payment_failed':
            console.log('Payment intent failed');
            break;
        case 'payment_intent.canceled':
            console.log('Payment intent canceled');
            break;
        case "charge.refunded":
            console.log('Charge refunded');
            break;
        case "charge.refund.updated":
            console.log('Charge refund updated');
            break;
        case "charge.dispute.created":
            console.log('Charge dispute created');
            break;
        case "charge.dispute.updated":
            console.log('Charge dispute updated');
            break;
        case "charge.dispute.closed":
            console.log('Charge dispute closed');
            break;
        case "payout.failed":
            break;
        case "payout.paid":
            break;
        case "payout.canceled":
            break;
        case "account.updated":
            this.handleAccountUpdated(event);
            break;
        }

        await this.prismaService.webhookEvent.updateMany({
            where: { id: event.id },
            data: { processed: true },
        });
    }

    async handleWebhookEvent(payload: Buffer, signature: string) {

        const event = await this.verifyWebhookSignature(payload, signature);

        await this.prismaService.webhookEvent.create({
            data: {
                eventType: event.type,
                payload: JSON.parse(JSON.stringify(event)),
                processed: false,
            },
        });

        return this.processWebhookEvent(event);
                
    }

    verifyWebhookSignature(payload: Buffer, signature: string) {

        const stripeSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
        if (!stripeSecret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
        }
        
        try {
            const event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                stripeSecret
            );
            return event;
        } catch (error) {
            throw new Error('Webhook signature verification failed');
        }
    }


    async handleCheckoutSessionCompleted(event: Stripe.Event) {

        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { orderId } = paymentIntent.metadata;

        const order = await this.prismaService.order.findUnique({
            where: { id: orderId },
        });

        if(!order){
            throw new NotFoundException('Order not found');
        }

        await this.prismaService.order.update({
            where: { id: orderId },
            data: { status: 'COMPLETED' },
        });

        await this.prismaService.wallet.update({
            where: { userId: order.sellerId },
            data: { balance: { increment: order.amount } },
        });
    }

    // to be checked if working
    async handleAccountUpdated(event: Stripe.Event) {
        const account = event.data.object as Stripe.Account;
        const accountId = account.id;

        if(account.charges_enabled && account.payouts_enabled){
            await this.prismaService.user.update({
                where: { stripeAccount: accountId },
                data: {
                    stripeStatus: 'verified',
                }
            });

        }
    }


    returnAllWebhooks() {
        return this.prismaService.webhookEvent.findMany();
    }
}