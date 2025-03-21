import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { PrismaService } from "src/prisma.service";
import Stripe from "stripe";

@Injectable()
export class OrderService {
    private stripe: Stripe;

    constructor(private readonly prismaService: PrismaService, private configService: ConfigService) {
        const stripeKey = configService.get<string>('STRIPE_SECRET_KEY');
        if (!stripeKey) {
            throw new Error('STRIPE_SECRET_KEY is not defined');
        }
        this.stripe = new Stripe(stripeKey, {
            apiVersion: '2025-02-24.acacia',
        });

    }
    getAllUserOrders(req: Request){
        return this.prismaService.order.findMany({
            where: { buyerId: req.user.userId },
            include: { product: true }
        });
    }

    async checkoutOrder(body: string, req: Request) {

        const product = await this.prismaService.product.findUnique({
            where: { id: body }
        });

        if(!product){
            throw new NotFoundException('Product not found');
        }

        const order = await this.prismaService.order.create({
            data: {
                sellerId: product.sellerId,
                buyerId: req.user.userId,
                productId: body,
                amount: product.price * 100,
            }
        });

        if(!order){
            throw new NotFoundException('Order not created');
        }
        const seller = await this.prismaService.user.findUnique({
            where: { id: product.sellerId }
        });

        if(!seller || !seller.stripeAccount){
            throw new NotFoundException('Seller not found or not connected to stripe');
        }

        try {
            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: ['card', 'blik', 'p24', 'klarna'],
                line_items: [
                    {
                        price_data: {
                            currency: 'pln',
                            product_data: {
                                name: product.title,
                            },
                            unit_amount: product.price * 100,
                        },
                        quantity: 1,
                    }
                ],
                mode: 'payment',
                success_url: 'https://example.com/success',
                cancel_url: 'https://example.com/cancel',
                payment_intent_data: {
                    transfer_data: {
                        destination: seller?.stripeAccount
                    }
                },
                metadata: {
                orderId: order.id,
                }
            });

            await this.prismaService.order.update({
                where: { id: order.id },
                data: { 
                    checkoutSessionId: session.id, 
                    paymentUrl: session.url
                }
            });
            

            return session;
        } catch (error) {
            throw new NotFoundException('Stripe error', error);
        }
    }

    async createRefund(body : { orderId: string}, req: Request) {

        const order = await this.prismaService.order.findUnique({
            where: { id: body.orderId }
        });

        

        if(!order || order.buyerId !== req.user.userId || !order.checkoutSessionId){
            throw new NotFoundException('Order not found');
        }

        if(order.createdAt.getTime() + 1000 * 60 * 60 * 24 * 14 < new Date().getTime()){
            throw new UnauthorizedException('Refund can be made only within 14 days of purchase');
        }

        try {
            const checkoutSession = await this.stripe.checkout.sessions.retrieve(order.checkoutSessionId);

            if(!checkoutSession.payment_intent){
                throw new NotFoundException('Payment intent not found');
            }

            const product = await this.prismaService.product.findUnique({
                where: { id: order.productId }
            });

            if(!product){
                throw new NotFoundException('Product not found');
            }


            const refund = await this.stripe.refunds.create({
                payment_intent: checkoutSession.payment_intent.toString(),
                amount: order.amount,
                metadata: { orderId: order.id }
            });

            await this.prismaService.order.update({
                where: { id: order.id },
                data: { status: 'REFUNDED' }
            });

            await this.prismaService.wallet.update({
                where: { userId:  product.sellerId},
                data: { balance: { decrement: order.amount } }
            })

            return refund
        } catch (error) {
            throw new NotFoundException('Stripe error', error);
        }

    }

}