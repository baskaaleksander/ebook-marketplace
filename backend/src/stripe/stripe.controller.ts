import { Body, Controller, Delete, Get, Header, Headers, NotFoundException, Param, Post, RawBodyRequest, Req, UseGuards} from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { StripeService } from './stripe.service';
import { AuthGuard } from '@nestjs/passport';
import { OrderService } from './order.service';
import { IdDto } from '../dtos/id.dto';
import { AmountDto } from './dtos/amount.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
  

@UseGuards(AuthGuard('jwt'))
  @Controller('stripe')
  export class StripeController {
    constructor(
        private readonly webhookService: WebhookService,
        private readonly stripeService: StripeService,
        private readonly orderService: OrderService
    ) {}
    
    @UseGuards(AuthGuard('jwt'))
    @Post('connect')
    connectAccount(@CurrentUser('userId') userId: string){
        return this.stripeService.connectAccount(userId);
    }

    @Get('connect/:id')
    getAccountDetails(@Param('id') id: string){
        return this.stripeService.checkAccountStatus(id);
    }

    @Delete('connect')
    disconnectAccount(@CurrentUser('userId') userId: string){
        return this.stripeService.disconnectAccount(userId);
    }

    @Post('order/checkout')
    checkoutOrder(@Body() body : IdDto, @CurrentUser('userId') userId: string){
        return this.orderService.checkoutOrder(body.id, userId);
    }

    @Post('order/refund')
    cancelOrder(@Body() body: IdDto, @CurrentUser('userId') userId: string){
        return this.orderService.createRefund(body.id, userId);
    }

    @Get('order')
    getAllUserOrders(@CurrentUser('userId') userId: string){
        return this.orderService.getAllUserOrders(userId);
    }

    @Get('orders/sold')
    getAllSoldOrders(@CurrentUser('userId') userId: string){
        return this.orderService.getAllSoldOrders(userId);
    }

    @Get('payouts')
    getAllPayouts(@CurrentUser('userId') userId: string){
        return this.stripeService.getAllUserPayouts(userId);
    }
    @Post('payout')
    payout(@Body() body: AmountDto, @CurrentUser('userId') userId: string){
        return this.stripeService.createPayout(body.amount, userId);
    }

    @Get('payout/:id')
    getPayout(@Param('id') id: string, @CurrentUser('userId') userId: string){
        return this.stripeService.getPayout(id, userId);
    }

    @Delete('payout/:id')
    cancelPayout(@Param('id') id: string, @CurrentUser('userId') userId: string){
        return this.stripeService.cancelPayout(id, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('balance')
    getBalance(@CurrentUser('userId') userId: string){
        // return this.stripeService.getCurrentBalance(userId);
        // mocked value
        return {
            "object": "balance",
            "available": [
              {
                "amount": 666670,
                "currency": "usd",
                "source_types": {
                  "card": 666670
                }
              }
            ],
            "connect_reserved": [
              {
                "amount": 0,
                "currency": "usd"
              }
            ],
            "livemode": false,
            "pending": [
              {
                "amount": 61414,
                "currency": "usd",
                "source_types": {
                  "card": 61414
                }
              }
            ]
          }
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