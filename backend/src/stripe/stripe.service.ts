import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma.service';

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


    async connectAccount(userId: string) {

        try {
            const account = await this.stripe.accounts.create({
                type: 'express',
                country: 'PL',
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });

            const user = await this.prismaService.user.findUnique({
                where: { id: userId }
            });

            if(!user){
                throw new NotFoundException('User not found');
            }

            if(user.stripeAccount){
                throw new NotFoundException('User already connected to stripe');
            }

            await this.prismaService.user.update({
                where: { id: userId },
                data: { stripeAccount: account.id }
            });

            const accountLink = await this.stripe.accountLinks.create({
                account: account.id,
                refresh_url: `${this.configService.get('FRONTEND_URL')}/reauth`,
                return_url: `${this.configService.get('FRONTEND_URL')}/return`,
                type: 'account_onboarding',
            });

            return accountLink;

        } catch (error) {
            throw new Error(`Stripe error ${error}`);
        }

    }

    async disconnectAccount(userId: string) {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId }
        });

        if(!user || !user.stripeAccount){
            throw new NotFoundException('User not found or not connected to stripe');
        }

        await this.prismaService.user.update({
            where: { id: userId },
            data: { stripeAccount: null, stripeStatus: 'unverified' }
        });
        try {
            await this.stripe.accounts.del(user.stripeAccount);
        }
        catch (error) {
            throw new NotFoundException('Stripe error', error);
        }
        return 'Account disconnected';
    }

    async createPayout(amount: number, userId: string) {

        const user = await this.prismaService.user.findUnique({
            where: { id: userId }
        });

        if(!user || !user.stripeAccount){
            throw new NotFoundException('User not found or not connected to stripe');
        }
        try {

            const account = await this.stripe.accounts.retrieve(user.stripeAccount);

            if(!account){
                throw new NotFoundException('Account not found');
            }

            const balance = await this.stripe.balance.retrieve({
                stripeAccount: user.stripeAccount
            });

            if(balance.available[0].amount < amount){
                throw new NotFoundException('Insufficient funds');
            }

            const payout = await this.stripe.payouts.create({
                amount: amount,
                currency: 'pln',
                metadata: { 'userId': user.id}
            },
            {
                stripeAccount: user.stripeAccount
            });

            await this.prismaService.payout.create({
                data: {
                    amount: amount,
                    userId: user.id,
                    stripePayoutId: payout.id

                }
            })


            return { message: 'Payout created', payout };

        } catch (error) {
            throw new Error(`Stripe error ${error}`);
        }
    }

    async getPayout(id: string, userId: string){
        const payout = await this.prismaService.payout.findUnique({
            where: { id: id }
        });

        if(!payout){
            throw new NotFoundException('Payout not found');
        }

        if(payout.userId !== userId){
            throw new UnauthorizedException('You are not authorized to view this payout');
        }

        return payout;
        
    }

    async cancelPayout(id: string, userId: string){

        try {

            const payout = await this.stripe.payouts.retrieve(id);

            if(!payout || !payout.metadata?.userId) {
                throw new NotFoundException('Payout not found');
            }

            if(payout.metadata.userId !== userId){
                throw new UnauthorizedException('You cannot cancel this payout');
            }

            if(payout.status !== 'pending'){
                throw new UnauthorizedException('Payout is not pending');
            }

            await this.stripe.payouts.cancel(id);

        } catch (error) {
            throw new Error(`Stripe error ${error}`);
        }

    }

    getAllUserPayouts(userId: string){
        return this.prismaService.payout.findMany({
            where: { userId: userId },
        });
    }
    
    async checkAccountStatus(id: string) {
        const account = await this.stripe.accounts.retrieve(id);

        return account;
    }

    async getCurrentBalance(userId: string) {

        const user = await this.prismaService.user.findUnique({
            where: { id: userId }
        });

        if(!user || !user.stripeAccount){
            throw new NotFoundException('User not found or not connected to stripe');
        }

        return this.stripe.balance.retrieve({
            stripeAccount: user.stripeAccount
        });
    }
}