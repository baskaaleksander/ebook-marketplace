import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {
    const stripeKey = configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createConnectAccount(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const account = await this.stripe.accounts.create({
      type: 'express', 
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await this.prismaService.user.update({
      where: { id: userId },
      data: { stripeAccount: account.id },
    });

    const accountLink = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${this.configService.get<string>('FRONTEND_URL')}/stripe/refresh`,
      return_url: `${this.configService.get<string>('FRONTEND_URL')}/stripe/return`,
      type: 'account_onboarding',
    });

    return accountLink.url;
  }

  async processPayment(orderId: string, productId: string, buyerId: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
      include: { seller: true },
    });

    const buyer = await this.prismaService.user.findUnique({
      where: { id: buyerId },
    });

    if (!product || !buyer) {
      throw new Error('Product or buyer not found');
    }

    if (!product.seller.stripeAccount) {
      throw new Error('Seller is not connected to Stripe');
    }

    const platformFee = Math.round(product.price * 100 * 0.10);
    const amountForSeller = Math.round(product.price * 100) - platformFee;


    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(product.price * 100), 
      currency: 'usd',
      application_fee_amount: platformFee,
      transfer_data: {
        destination: product.seller.stripeAccount,
      },
      metadata: {
        orderId: orderId,
        productId: productId,
        buyerId: buyerId,
      },
    });

    await this.prismaService.order.update({
      where: { id: orderId },
      data: { stripePaymentId: paymentIntent.id },
    });

    return paymentIntent.client_secret;
  }

  async handleSuccessfulPayment(paymentIntentId: string) {
    const order = await this.prismaService.order.findFirst({
      where: { stripePaymentId: paymentIntentId },
      include: { product: { include: { seller: true } } },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    await this.prismaService.order.update({
      where: { id: order.id },
      data: { status: 'COMPLETED' },
    });

    await this.prismaService.user.update({
      where: { id: order.product.sellerId },
      data: { 
        balance: { increment: order.amount * 0.9 } // 90% to seller
      },
    });

    return order;
  }

  async createPaymentLink(productId: string, buyerId: string) {
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
      include: { seller: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (!product.seller.stripeAccount) {
      throw new Error('Seller is not connected to Stripe');
    }

    const order = await this.prismaService.order.create({
      data: {
        buyerId,
        productId,
        amount: product.price,
        status: 'PENDING',
        stripePaymentId: 'temp_' + Date.now(),
      },
    });

    const clientSecret = await this.processPayment(order.id, productId, buyerId);
    
    return { clientSecret, orderId: order.id };
  }

  verifyWebhookSignature(payload: Buffer, signature: string) {
    try {
      const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
      }
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
      return event;
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }
  async getAccountDetails(accountId: string) {
    return this.stripe.accounts.retrieve(accountId);
  }
  
  async createDashboardLink(accountId: string) {
    const loginLink = await this.stripe.accounts.createLoginLink(accountId);
    return loginLink.url;
  }

  async refreshConnectAccountLink(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
  
    if (!user) {
      throw new Error('User not found');
    }
  
    if (!user.stripeAccount) {
      return this.createConnectAccount(userId);
    }
  
    const accountLink = await this.stripe.accountLinks.create({
      account: user.stripeAccount,
      refresh_url: `${this.configService.get<string>('FRONTEND_URL')}/stripe/refresh`,
      return_url: `${this.configService.get<string>('FRONTEND_URL')}/stripe/return`,
      type: 'account_onboarding',
    });
  
    return accountLink.url;
  }
}