import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma.service";
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
    async getAllUserOrders(userId: string) {
        const orders = await this.prismaService.order.findMany({
            where: { buyerId: userId },
            include: { 
                product: true 
            },
            orderBy: { createdAt: 'desc' }
        }).then(orders => orders.map(order => {

            if (order.status === 'REFUNDED' || order.status === 'PENDING' && order.product) {
                const { fileUrl, ...productWithoutFileUrl } = order.product || {};
                return { ...order, product: productWithoutFileUrl };
            }
            return {
                id: order.id,
                sellerId: order.sellerId,
                buyerId: order.buyerId,
                isReviewed: order.isReviewed,
                productId: order.productId,
                product: order.product,
                refundId: order?.refundId || null,
                status: order.status,
                amount: order.amount,
                checkoutSessionId: order?.checkoutSessionId || null,
                paymentUrl: order?.paymentUrl || null,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
            };
        }));

        return {
            data: orders,
            count: orders.length,
            message: 'Orders fetched successfully'
        }
    }
    async getAllSoldOrders(userId: string){
        const orders = await this.prismaService.order.findMany({
            where: { sellerId: userId },
            include: { product: true },
            orderBy: { createdAt: 'desc' }
        });

        const mappedOrders = orders.map(order => {
            if (order.status === 'REFUNDED' || order.status === 'PENDING' && order.product) {
                const { fileUrl, ...productWithoutFileUrl } = order.product || {};
                return { ...order, product: productWithoutFileUrl };
            }
            return {
                id: order.id,
                sellerId: order.sellerId,
                buyerId: order.buyerId,
                isReviewed: order.isReviewed,
                productId: order.productId,
                product: order.product,
                refundId: order?.refundId || null,
                status: order.status,
                amount: order.amount,
                checkoutSessionId: order?.checkoutSessionId || null,
                paymentUrl: order?.paymentUrl || null,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
            };
        }
        );

        return {
            data: mappedOrders,
            count: mappedOrders.length,
            message: 'Orders fetched successfully'
        }

    }


    async checkoutOrder(body: string, userId: string) {

        const product = await this.prismaService.product.findUnique({
            where: { id: body }
        });

        if(!product){
            throw new NotFoundException('Product not found');
        }

        const order = await this.prismaService.order.create({
            data: {
                sellerId: product.sellerId,
                buyerId: userId,
                productId: body,
                amount: product.price * 100,
            }
        });

        const buyer = await this.prismaService.user.findUnique({
            where: { id: userId },
        });

        if(!buyer){
            throw new NotFoundException('Buyer not found or address not set');
        }

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
                success_url: `${this.configService.get('FRONTEND_URL')}/user/dashboard/purchased`,
                cancel_url: `${this.configService.get('FRONTEND_URL')}/`,
                payment_intent_data: {
                    application_fee_amount: product.price * 5,
                    transfer_data: {
                        destination: seller?.stripeAccount
                    }
                },
                customer_email: buyer.email,
                billing_address_collection: 'auto',
                invoice_creation: {
                    enabled: true,
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

    async createRefund(body : string, userId: string) {

        const order = await this.prismaService.order.findUnique({
            where: { id: body }
        });

        

        if(!order || order.buyerId !== userId || !order.checkoutSessionId){
            throw new NotFoundException('Order not found');
        }

        if(order.createdAt.getTime() + 1000 * 60 * 60 * 24 * 14 < new Date().getTime()){
            throw new UnauthorizedException('Refund can be made only within 14 days of purchase');
        }


            const checkoutSession = await this.stripe.checkout.sessions.retrieve(order.checkoutSessionId);

            if(!checkoutSession.payment_intent){
                throw new NotFoundException('Payment intent not found');
            }

            if(!order.productId) {
                throw new NotFoundException('Product not found');
            }

            const product = await this.prismaService.product.findUnique({
                where: { id: order.productId }
            });

            if(!product){
                throw new NotFoundException('Product not found');
            }


            const refund = await this.stripe.refunds.create({
                payment_intent: checkoutSession.payment_intent.toString(),
                reason: 'requested_by_customer',
                amount: order.amount,
                metadata: { orderId: order.id }
            });

            await this.prismaService.order.update({
                where: { id: order.id },
                data: { status: 'REFUNDED', refundId: refund.id }
            });

            await this.prismaService.refund.create({
                data: {
                    orderId: order.id,
                    refundId: refund.id,
                    amount: order.amount,
                    status: 'CREATED',
                    reason: 'requested_by_customer',
                }
            })


            return { message: 'Refund created successfully', refund };

    }


}