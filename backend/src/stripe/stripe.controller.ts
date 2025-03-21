import { Body, Controller, Delete, Get, Header, Headers, NotFoundException, Param, Post, RawBodyRequest, Req, UseGuards} from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { StripeService } from './stripe.service';
import { AuthGuard } from '@nestjs/passport';
import { OrderService } from './order.service';
  

@UseGuards(AuthGuard('jwt'))
  @Controller('stripe')
  export class StripeController {
    constructor(
        private readonly webhookService: WebhookService,
        private readonly stripeService: StripeService,
        private readonly orderService: OrderService
    ) {}
  
    @Post('connect')
    connectAccount(@Req() req: Request){
        return this.stripeService.connectAccount(req);
    }

    @Get('connect/:id')
    getAccountDetails(@Param('id') id: string){
        return this.stripeService.checkAccountStatus(id);
    }

    @Delete('connect')
    disconnectAccount(@Req() req: Request){
        return this.stripeService.disconnectAccount(req);
    }

    @Post('order/checkout')
    checkoutOrder(@Body() body : {productId: string}, @Req() req: Request){
        return this.orderService.checkoutOrder(body.productId, req);
    }

    @Post('order/refund')
    cancelOrder(@Body() body: { orderId: string }, @Req() req: Request){
        return this.orderService.createRefund(body, req);
    }

    @Get('order')
    getAllUserOrders(@Req() req: Request){
        return this.orderService.getAllUserOrders(req);
    }

    @Post('payout')
    payout(@Body() body: { amount: number }, @Req() req: Request){
        return this.stripeService.createPayout(body.amount, req);
    }

    @Get('payout/:id')
    getPayout(@Param('id') id: string, @Req() req: Request){
        return this.stripeService.getPayout(id, req);
    }

    @Delete('payout/:id')
    cancelPayout(@Param('id') id: string, @Req() req: Request){
        return this.stripeService.cancelPayout(id, req);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('balance')
    getBalance(@Req() req: Request){
        return this.stripeService.getCurrentBalance(req);
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