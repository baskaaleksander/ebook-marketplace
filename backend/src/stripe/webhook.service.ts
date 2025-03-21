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
            this.handlePaymentIntentFailed(event);
            break;
        case 'payment_intent.canceled':
            this.handlePaymentIntentCanceled(event);
            break;
        case "charge.refunded":
            this.handleRefundCompleted(event);
            break;
        case "refund.created":
            this.handleRefundCreated(event);
            break;
        case "refund.failed":
            this.handleRefundFailed(event);
            break;
        case "payout.failed":
            this.handlePayoutFailed(event);
            break;
        case "payout.paid":
            this.handlePayoutPaid(event);
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

    async handlePaymentIntentFailed(event: Stripe.Event) {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { orderId } = paymentIntent.metadata;

        await this.prismaService.order.update({
            where: { id: orderId },
            data: { status: 'FAILED' },
        });
    }

    async handlePaymentIntentCanceled(event: Stripe.Event) {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { orderId } = paymentIntent.metadata;

        await this.prismaService.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
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

    async handlePayoutFailed(event: Stripe.Event) {
        const payout = event.data.object as Stripe.Payout;

        const existingPayout = await this.prismaService.payout.findUnique({
            where: { id: payout.id },
        });
        
        await this.prismaService.payout.update({
            where: { id: payout.id },
            data: { status: 'FAILED' },
        });

        await this.prismaService.wallet.update({
            where: { userId: existingPayout?.userId },
            data: { balance: { increment: payout.amount } },
        });

    }

    async handlePayoutPaid(event: Stripe.Event) {
        const payout = event.data.object as Stripe.Payout;
        
        await this.prismaService.payout.update({
            where: { id: payout.id },
            data: { status: 'COMPLETED' },
        });
    }

    async handleRefundCreated(event: Stripe.Event) {
        const refund = event.data.object as Stripe.Refund;

        if(!refund.metadata){
            throw new NotFoundException('Refund metadata not found');
        }

        await this.prismaService.refund.update({
            where: { orderId: refund.metadata.orderId },
            data: { status: 'CREATED'}
        })

    }

    async handleRefundCompleted(event: Stripe.Event) {
        const refund = event.data.object as Stripe.Refund;

        if(!refund.metadata){
            throw new NotFoundException('Refund metadata not found');
        }

        await this.prismaService.refund.update({
            where: { orderId: refund.metadata.orderId },
            data: { status: 'COMPLETED'}
        })

        await this.prismaService.order.update({
            where: { id: refund.metadata.orderId },
            data: { status: 'REFUNDED'}
        })
    }

    async handleRefundFailed(event: Stripe.Event) {
        const refund = event.data.object as Stripe.Refund;

        if(!refund.metadata){
            throw new NotFoundException('Refund metadata not found');
        }

        await this.prismaService.refund.update({
            where: { orderId: refund.metadata.orderId },
            data: { status: 'FAILED'}
        })

    }
            

    returnAllWebhooks() {
        return this.prismaService.webhookEvent.findMany();
    }
}