import { Body, Controller, Delete, Get, Header, Headers, NotFoundException, Param, Post, RawBodyRequest, Req, UseGuards} from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { StripeService } from './stripe.service';
import { AuthGuard } from '@nestjs/passport';
import { OrderService } from './order.service';
import { IdDto } from '../dtos/id.dto';
import { AmountDto } from './dtos/amount.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { FeaturedService } from './featured.service';
  

  @Controller('stripe')
  export class StripeController {
    constructor(
        private readonly webhookService: WebhookService,
        private readonly stripeService: StripeService,
        private readonly orderService: OrderService,
        private readonly featuredService: FeaturedService,
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

    @UseGuards(AuthGuard('jwt'))
    @Post('checkout-featuring/:productId')
    featureProduct(@Param('productId') productId: string, @CurrentUser('userId') userId: string, @Body() body : { time: number }){
        return this.featuredService.checkoutFeaturing(productId, body.time, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('connect')
    disconnectAccount(@CurrentUser('userId') userId: string){
        return this.stripeService.disconnectAccount(userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('order/checkout')
    checkoutOrder(@Body() body : IdDto, @CurrentUser('userId') userId: string){
        return this.orderService.checkoutOrder(body.id, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('order/refund')
    cancelOrder(@Body() body: IdDto, @CurrentUser('userId') userId: string){
        return this.orderService.createRefund(body.id, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('orders')
    getAllUserOrders(@CurrentUser('userId') userId: string){
        return this.orderService.getAllUserOrders(userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('orders/sold')
    getAllSoldOrders(@CurrentUser('userId') userId: string){
        return this.orderService.getAllSoldOrders(userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('payouts')
    getAllPayouts(@CurrentUser('userId') userId: string){
        return this.stripeService.getAllUserPayouts(userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('payout')
    payout(@Body() body: AmountDto, @CurrentUser('userId') userId: string){
        return this.stripeService.createPayout(body.amount, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('payout/:id')
    getPayout(@Param('id') id: string, @CurrentUser('userId') userId: string){
        return this.stripeService.getPayout(id, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('payout/:id')
    cancelPayout(@Param('id') id: string, @CurrentUser('userId') userId: string){
        return this.stripeService.cancelPayout(id, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('balance')
    getBalance(@CurrentUser('userId') userId: string){
        return this.stripeService.getCurrentBalance(userId);
        // mocked value
        // return {
        //     "object": "balance",
        //     "available": [
        //       {
        //         "amount": 666670,
        //         "currency": "usd",
        //         "source_types": {
        //           "card": 666670
        //         }
        //       }
        //     ],
        //     "connect_reserved": [
        //       {
        //         "amount": 0,
        //         "currency": "usd"
        //       }
        //     ],
        //     "livemode": false,
        //     "pending": [
        //       {
        //         "amount": 61414,
        //         "currency": "usd",
        //         "source_types": {
        //           "card": 61414
        //         }
        //       }
        //     ]
        //   }
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