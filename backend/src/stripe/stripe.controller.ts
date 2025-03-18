import { Controller, Delete, Get, Header, Headers, NotFoundException, Param, Post, RawBodyRequest, Req} from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { StripeService } from './stripe.service';
  
  @Controller('stripe')
  export class StripeController {
    constructor(
        private readonly webhookService: WebhookService,
        private readonly stripeService: StripeService
    ) {}
  
    @Post('connect')
    connectAccount(){
        return 'Connect Account';
    }
    @Get('connect/:id')
    getAccountDetails(@Param('id') id: string){
        return 'Get Account';
    }

    @Post('connect/link')
    getAccountLink()
    {
        return 'Account Link';
    }

    @Delete('connect/:id')
    disconnectAccount(@Param('id') id: string){
        return 'Disconnect Account';
    }

    @Post('order/checkout')
    checkoutOrder(){
        return this.stripeService.checkoutOrder();
    }

    @Post('order/refund')
    cancelOrder(){
        return 'Cancel Order';
    }

    @Post('payout')
    payout(){
        return 'Payout';
    }

    @Get('payout/:id')
    getPayout(@Param('id') id: string){
        return 'Get Payout';
    }

    @Post('webhook')
    webhook(
        @Headers('stripe-signature') signature: string, 
        @Req() request: RawBodyRequest<Request> 
    ){
        const payload = request.rawBody;
        if(!payload){
            throw new NotFoundException('Request body is required');
        }

        return this.webhookService.handleWebhookEvent(payload, signature);
    }

    @Get('webhook')
    webhookTest(){
        return this.webhookService.returnAllWebhooks();
    }
  }