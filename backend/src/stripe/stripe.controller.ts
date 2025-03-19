import { Body, Controller, Delete, Get, Header, Headers, NotFoundException, Param, Post, RawBodyRequest, Req, UseGuards} from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { StripeService } from './stripe.service';
import { AuthGuard } from '@nestjs/passport';
  
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

    @UseGuards(AuthGuard('jwt'))
    @Post('order/checkout')
    checkoutOrder(@Body() body : [string], @Req() req: Request){
        return this.stripeService.checkoutOrder(body, req);
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