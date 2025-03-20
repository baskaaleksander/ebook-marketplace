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
  
    @UseGuards(AuthGuard('jwt'))
    @Post('connect')
    connectAccount(@Req() req: Request){
        return this.stripeService.connectAccount(req);
    }
    @Get('connect/:id')
    getAccountDetails(@Param('id') id: string){
        return this.stripeService.checkAccountStatus(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('connect')
    disconnectAccount(@Req() req: Request){
        return this.stripeService.disconnectAccount(req);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('order/checkout')
    checkoutOrder(@Body() body : {productId: string}, @Req() req: Request){
        return this.stripeService.checkoutOrder(body.productId, req);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('order/refund')
    cancelOrder(@Body() body: { orderId: string }, @Req() req: Request){
        return this.stripeService.createRefund(body, req);
    }

    @Get('order')
    getAllOrders(){
        return this.stripeService.getAllOrders();
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('payout')
    payout(@Body() body: { amount: number }, @Req() req: Request){
        return this.stripeService.createPayout(body.amount, req);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('payout/:id')
    getPayout(@Param('id') id: string, @Req() req: Request){
        return this.stripeService.getPayout(id, req);
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