import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from 'src/prisma.service';
import { Request } from 'express';

@Injectable()
export class StripeService {
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

    async checkoutOrder(body: [string], req: Request) {

        const itemPromises = body.map(async (item) => {
            const product = await this.prismaService.product.findUnique({
                where: { id: item }
            });

            if (!product) {
                throw new NotFoundException('Product not found');
            }

            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.title,
                        metadata: {
                            sellerId: product.sellerId
                        }
                    },
                    unit_amount: product.price * 100,
                },
                quantity: 1,
            }
        });

        const items = await Promise.all(itemPromises);

        const order = await this.prismaService.order.create({
            data: {
                buyerId: req.user.userId,
                productId: body,
                amount: items.reduce((acc, item) => acc + item.price_data.unit_amount, 0),
            }
        });

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items,
            mode: 'payment',
            success_url: 'https://example.com/success',
            cancel_url: 'https://example.com/cancel',
            metadata: {
            orderId: order.id,
            }
        });

        

        return session;
    }
}