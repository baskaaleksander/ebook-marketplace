import { Controller, Delete, Get, Param, Post} from '@nestjs/common';
  
  @Controller('stripe')
  export class StripeController {
    constructor() {}
  
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
        return 'Checkout Order';
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
    webhook(){
        return 'Webhook';
    }
  }