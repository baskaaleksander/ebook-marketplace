import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

@Injectable()
export class FeaturedService {
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


    async markAsFeatured(productId: string, time: string) {
        const product = await this.prismaService.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const dateOfExpiring = new Date(Date.now() + parseInt(time) * 24 * 60 * 60 * 1000);

        await this.prismaService.product.update({
            where: { id: productId },
            data: { 
                isFeatured: true,
                featuredForTime: dateOfExpiring,
             }
        });

        return {
            data: {
                productId: productId,
                productName: product.title,
                dateOfExpiring
            },
            message: 'Product marked as featured',
        }
    }

    async checkoutFeaturing(productId: string, time: number, userId: string) {

        const user = await this.prismaService.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const dateOfExpiring = new Date(Date.now() + time * 24 * 60 * 60 * 1000);

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card', 'blik', 'p24', 'klarna'],
            line_items: [
                {
                    price_data: {
                        currency: 'pln',
                        product_data: {
                            name: `Featuring for your listing till ${dateOfExpiring.toLocaleDateString('pl-PL')}`,
                            description: 'Let your product shine and be seen by more buyers',
                        },
                        unit_amount: 1500,
                    },
                    quantity: 1,
                }
            ],
            mode: 'payment',
            success_url: `${this.configService.get('FRONTEND_URL')}/user/dashboard/purchased`,
            cancel_url: `${this.configService.get('FRONTEND_URL')}/`,
            customer_email: user.email,
            billing_address_collection: 'auto',
            invoice_creation: {
                enabled: true,
            },
            metadata: {
                productId,
                time,
            }
        });

        return {
            data: {
                sessionId: session.id,
                url: session.url,
                productId: productId,
                dateOfExpiring
            },
            message: 'Checkout session created',
        }
    }
}