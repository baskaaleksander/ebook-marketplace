import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import Stripe from 'stripe';
import { FeaturedService } from './featured.service';

@Injectable()
export class WebhookService {
    private stripe: Stripe;
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
    private featuredService: FeaturedService
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
            await this.handleCheckoutSessionCompleted(event);
            break;
        case 'payment_intent.payment_failed':
            await this.handlePaymentIntentFailed(event);
            break;
        case 'payment_intent.canceled':
            await this.handlePaymentIntentCanceled(event);
            break;
        case "charge.refunded":
            await this.handleRefundCompleted(event);
            break;
        case "refund.created":
            await this.handleRefundCreated(event);
            break;
        case "refund.failed":
            await this.handleRefundFailed(event);
            break;
        case "payout.failed":
            await this.handlePayoutFailed(event);
            break;
        case "payout.paid":
            await this.handlePayoutPaid(event);
            break;
        case "account.updated":
            await this.handleAccountUpdated(event);
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
            throw new Error(`Webhook signature verification failed: ${error.message}`);
        }
    }


    async handleCheckoutSessionCompleted(event: Stripe.Event) {

        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        if(paymentIntent.metadata.productId && paymentIntent.metadata.time) {
            return this.featuredService.markAsFeatured(paymentIntent.metadata.productId, paymentIntent.metadata.time);
        }

        if (!paymentIntent.metadata || !paymentIntent.metadata.orderId) {
            throw new NotFoundException('Order ID not found in metadata');
        }

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


    }

    async handlePaymentIntentFailed(event: Stripe.Event) {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { orderId } = paymentIntent.metadata;
        
        // First find the order - this was missing
        const order = await this.prismaService.order.findUnique({
            where: { id: orderId },
        });
        
        if (!order) {
            throw new Error('Order not found');
        }
    
        // Then update it
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

        if(!refund.metadata?.id){
            throw new NotFoundException('Refund metadata not found');
        }

        await this.prismaService.refund.update({
            where: { refundId: refund.id },
            data: { status: 'COMPLETED'}
        })

        await this.prismaService.order.update({
            where: { id: refund.metadata.orderId },
            data: { status: 'REFUNDED'}
        })

    }

    async handleRefundFailed(event: Stripe.Event) {
        const refund = event.data.object as Stripe.Refund;


        await this.prismaService.refund.update({
            where: { refundId: refund.id },
            data: { status: 'FAILED'}
        })

    }
            

    returnAllWebhooks() {
        return this.prismaService.webhookEvent.findMany();
    }
}