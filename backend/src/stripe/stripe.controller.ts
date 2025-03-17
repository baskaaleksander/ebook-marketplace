import { 
    Controller, 
    Post, 
    Body, 
    Headers, 
    RawBodyRequest, 
    Req, 
    Get, 
    Param,
    UseGuards,
    Query,
    NotFoundException
  } from '@nestjs/common';
  import { AuthGuard } from '@nestjs/passport';
  import { Request } from 'express';
  import { StripeService } from './stripe.service';
  import { WebhookService } from './webhook.service';
  import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';
  
  @Controller('stripe')
  export class StripeController {
    constructor(
      private stripeService: StripeService,
      private webhookService: WebhookService,
      private prismaService: PrismaService,
      private configService: ConfigService,
    ) {}
  
    @Get()
    async getAllOrders(){
        const orders = await this.prismaService.order.findMany();

        return orders;
    }

    @Post('webhook')
    async handleWebhook(
      @Req() request: RawBodyRequest<Request>,
      @Headers('stripe-signature') signature: string,
    ) {
      const payload = request.rawBody;
      
      if (!payload) {
        throw new Error('No payload received');
      }
      
      const event = this.stripeService.verifyWebhookSignature(payload, signature);
      
      await this.prismaService.webhookEvent.create({
        data: {
          eventType: event.type,
          payload: JSON.parse(JSON.stringify(event)),
          processed: false,
        },
      });
  
      this.webhookService.processWebhookEvent(event);
      
      return { received: true };
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Get('connect')
    async createConnectAccount(@Req() req: Request) {
      const userId = req.user.userId;
      const onboardingUrl = await this.stripeService.createConnectAccount(userId);
      return { url: onboardingUrl };
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Get('account-status')
    async getAccountStatus(@Req() req: Request) {
      const user = await this.prismaService.user.findUnique({
        where: { id: req.user.userId },
      });

      if(!user){
        throw new NotFoundException('User not found');
      }
  
      if (!user.stripeAccount) {
        return { connected: false };
      }
  
      const account = await this.stripeService.getAccountDetails(user.stripeAccount);
      
      return {
        connected: true,
        detailsSubmitted: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled
      };
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Post('buy/:productId')
    async createPayment(
      @Param('productId') productId: string,
      @Req() req: Request
    ) {
      const result = await this.stripeService.createPaymentLink(
        productId,
        req.user.userId
      );
      return result;
    }
  
    @UseGuards(AuthGuard('jwt'))
    @Get('dashboard-link')
    async createDashboardLink(@Req() req: Request) {
      const user = await this.prismaService.user.findUnique({
        where: { id: req.user.userId },
      });
      if(!user){
        throw new NotFoundException('User not found');
      }

      if (!user.stripeAccount) {
        throw new Error('No Stripe Connect account found');
      }
  
      const link = await this.stripeService.createDashboardLink(user.stripeAccount);
      return { url: link };
    }

    @Get('success')
    async handlePaymentSuccess(@Query() query: { session_id: string, orderId: string }) {
      const paymentIntentId = query.orderId;
      const order = await this.stripeService.handleSuccessfulPayment(paymentIntentId);
      return order;
    }

    @Get('return')
    async handleConnectReturn(@Query('account') accountId: string) {
    if (accountId) {
        const user = await this.prismaService.user.findFirst({
        where: { stripeAccount: accountId },
        });

        if (!user) {
        throw new NotFoundException('User not found for this Stripe account');
        }

        const account = await this.stripeService.getAccountDetails(accountId);
        
        if (account.details_submitted) {
        return { 
            success: true, 
            message: 'Onboarding completed successfully', 
            redirectUrl: `${this.configService.get<string>('FRONTEND_URL')}/dashboard` 
        };
        } else {
        return { 
            success: false, 
            message: 'Onboarding was not completed', 
            redirectUrl: `${this.configService.get<string>('FRONTEND_URL')}/account` 
        };
        }
    } else {
        return { 
        success: false, 
        message: 'Onboarding process was abandoned', 
        redirectUrl: `${this.configService.get<string>('FRONTEND_URL')}/account` 
        };
    }
    }

    @Get('refresh')
    async handleConnectRefresh(@Query('account') accountId: string, @Req() req: Request) {
    
    let userId;
    
    if (accountId) {
        const user = await this.prismaService.user.findFirst({
        where: { stripeAccount: accountId },
        });
        
        if (user) {
        userId = user.id;
        } else {
        try {
            userId = req.user.userId;
        } catch (e) {
            throw new NotFoundException('Could not determine user');
        }
        }
    } else {
        try {
        userId = req.user.userId;
        } catch (e) {
        throw new NotFoundException('Could not determine user');
        }
    }
    
    const onboardingUrl = await this.stripeService.refreshConnectAccountLink(userId);
    
    return { 
        url: onboardingUrl,
        redirectUrl: onboardingUrl
    };
    }
    
  }