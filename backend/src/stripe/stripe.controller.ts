import { Body, Controller, Delete, Get, Headers, NotFoundException, Param, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { StripeService } from './stripe.service';
import { AuthGuard } from '@nestjs/passport';
import { OrderService } from './order.service';
import { IdDto } from '../dtos/id.dto';
import { AmountDto } from './dtos/amount.dto';
import { CurrentUser } from '../decorators/current-user.decorator';
import { FeaturedService } from './featured.service';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse, 
  ApiTags, 
  ApiParam, 
  ApiBody,
  ApiHeader
} from '@nestjs/swagger';

@ApiTags('Stripe Integration')
@Controller('stripe')
export class StripeController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly stripeService: StripeService,
    private readonly orderService: OrderService,
    private readonly featuredService: FeaturedService,
  ) {}
  
  @ApiOperation({ summary: 'Connect user account to Stripe' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully connected to Stripe',
    schema: {
      example: {
        object: 'account_link',
        created: 1619559293,
        expires_at: 1619559593,
        url: 'https://connect.stripe.com/setup/e/acct_1J5X9QKZN8U5Y2Kq/UuJKlw9STwkk',
        // Note: This URL is a placeholder
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found or already connected' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('connect')
  connectAccount(@CurrentUser('userId') userId: string) {
    return this.stripeService.connectAccount(userId);
  }

  @ApiOperation({ summary: 'Get Stripe account details' })
  @ApiParam({ name: 'id', description: 'Stripe account ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Stripe account details',
    schema: {
      example: {
        id: 'acct_1J5X9QKZN8U5Y2Kq',
        object: 'account',
        charges_enabled: true,
        country: 'PL',
        default_currency: 'pln',
        details_submitted: true,
        email: 'user@example.com',
        payouts_enabled: true
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @Get('connect/:id')
  getAccountDetails(@Param('id') id: string) {
    return this.stripeService.checkAccountStatus(id);
  }

  @ApiOperation({ summary: 'Feature a product for a specific time period' })
  @ApiParam({ name: 'productId', description: 'Product ID to feature' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        time: {
          type: 'number',
          description: 'Feature duration in days',
          example: 7
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Checkout session created for featuring',
    schema: {
      example: {
        data: {
          sessionId: 'cs_test_a1b2c3d4e5f6g7h8i9j0',
          url: 'https://checkout.stripe.com/pay/cs_test_a1b2c3',
          productId: 'product_123',
          dateOfExpiring: '2025-05-16T12:34:56.789Z'
        },
        message: 'Checkout session created'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User or product not found' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('checkout-featuring/:productId')
  featureProduct(@Param('productId') productId: string, @CurrentUser('userId') userId: string, @Body() body: { time: number }) {
    return this.featuredService.checkoutFeaturing(productId, body.time, userId);
  }

  @ApiOperation({ summary: 'Disconnect user from Stripe' })
  @ApiResponse({ 
    status: 200, 
    description: 'Stripe account disconnected',
    schema: {
      example: 'Account disconnected'
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found or not connected to Stripe' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('connect')
  disconnectAccount(@CurrentUser('userId') userId: string) {
    return this.stripeService.disconnectAccount(userId);
  }

  @ApiOperation({ summary: 'Create checkout session for order' })
  @ApiBody({ type: IdDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Checkout session created',
    schema: {
      example: {
        id: 'cs_test_a1b2c3d4e5f6g7h8i9j0',
        object: 'checkout.session',
        cancel_url: 'http://localhost:3000/',
        payment_status: 'unpaid',
        status: 'open',
        success_url: 'http://localhost:3000/user/dashboard/purchased',
        url: 'https://checkout.stripe.com/pay/cs_test_a1b2c3'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product, buyer or seller not found' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('order/checkout')
  checkoutOrder(@Body() body: IdDto, @CurrentUser('userId') userId: string) {
    return this.orderService.checkoutOrder(body.id, userId);
  }

  @ApiOperation({ summary: 'Create refund for order' })
  @ApiBody({ type: IdDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Refund created',
    schema: {
      example: {
        message: 'Refund created successfully',
        refund: {
          id: 're_1J5X9QKZN8U5Y2Kq',
          object: 'refund',
          amount: 1999,
          currency: 'pln',
          payment_intent: 'pi_1J5X9QKZN8U5Y2Kq',
          status: 'succeeded'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized or refund period expired' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('order/refund')
  cancelOrder(@Body() body: IdDto, @CurrentUser('userId') userId: string) {
    return this.orderService.createRefund(body.id, userId);
  }

  @ApiOperation({ summary: 'Get all user orders' })
  @ApiResponse({ 
    status: 200, 
    description: 'User orders retrieved',
    schema: {
      example: {
        data: [
          {
            id: 'order_123',
            sellerId: 'user_456',
            buyerId: 'user_123',
            productId: 'product_123',
            isReviewed: false,
            product: {
              id: 'product_123',
              title: 'E-book Title',
              price: 19.99,
              description: 'Description',
              imageUrl: 'https://example.com/image.jpg'
              // fileUrl omitted for security
            },
            refundId: null,
            status: 'COMPLETED',
            amount: 1999,
            checkoutSessionId: 'cs_test_a1b2c3',
            paymentUrl: 'https://checkout.stripe.com/pay/cs_test_a1b2c3',
            createdAt: '2025-05-09T12:34:56.789Z',
            updatedAt: '2025-05-09T12:34:56.789Z'
          }
        ],
        count: 1,
        message: 'Orders fetched successfully'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('orders')
  getAllUserOrders(@CurrentUser('userId') userId: string) {
    return this.orderService.getAllUserOrders(userId);
  }

  @ApiOperation({ summary: 'Get all sold orders' })
  @ApiResponse({ 
    status: 200, 
    description: 'Sold orders retrieved',
    schema: {
      example: {
        data: [
          {
            id: 'order_123',
            sellerId: 'user_123',
            buyerId: 'user_456',
            productId: 'product_123',
            isReviewed: false,
            product: {
              id: 'product_123',
              title: 'E-book Title',
              price: 19.99,
              description: 'Description',
              imageUrl: 'https://example.com/image.jpg'
              // fileUrl included for seller
            },
            refundId: null,
            status: 'COMPLETED',
            amount: 1999,
            checkoutSessionId: 'cs_test_a1b2c3',
            paymentUrl: 'https://checkout.stripe.com/pay/cs_test_a1b2c3',
            createdAt: '2025-05-09T12:34:56.789Z',
            updatedAt: '2025-05-09T12:34:56.789Z'
          }
        ],
        count: 1,
        message: 'Orders fetched successfully'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('orders/sold')
  getAllSoldOrders(@CurrentUser('userId') userId: string) {
    return this.orderService.getAllSoldOrders(userId);
  }

  @ApiOperation({ summary: 'Get all user payouts' })
  @ApiResponse({ 
    status: 200, 
    description: 'User payouts retrieved',
    schema: {
      example: [
        {
          id: 'payout_123',
          userId: 'user_123',
          amount: 10000,
          status: 'COMPLETED',
          stripePayoutId: 'po_1J5X9QKZN8U5Y2Kq',
          createdAt: '2025-05-09T12:34:56.789Z',
          updatedAt: '2025-05-09T12:34:56.789Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('payouts')
  getAllPayouts(@CurrentUser('userId') userId: string) {
    return this.stripeService.getAllUserPayouts(userId);
  }

  @ApiOperation({ summary: 'Create a payout' })
  @ApiBody({ type: AmountDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Payout created',
    schema: {
      example: {
        message: 'Payout created',
        payout: {
          id: 'po_1J5X9QKZN8U5Y2Kq',
          object: 'payout',
          amount: 10000,
          arrival_date: 1619559293,
          currency: 'pln',
          status: 'pending'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found or insufficient funds' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('payout')
  payout(@Body() body: AmountDto, @CurrentUser('userId') userId: string) {
    return this.stripeService.createPayout(body.amount, userId);
  }

  @ApiOperation({ summary: 'Get payout details' })
  @ApiParam({ name: 'id', description: 'Payout ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Payout details retrieved',
    schema: {
      example: {
        id: 'payout_123',
        userId: 'user_123',
        amount: 10000,
        status: 'COMPLETED',
        stripePayoutId: 'po_1J5X9QKZN8U5Y2Kq',
        createdAt: '2025-05-09T12:34:56.789Z',
        updatedAt: '2025-05-09T12:34:56.789Z'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payout not found' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('payout/:id')
  getPayout(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.stripeService.getPayout(id, userId);
  }

  @ApiOperation({ summary: 'Cancel a payout' })
  @ApiParam({ name: 'id', description: 'Payout ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Payout canceled',
    schema: {
      example: 'Payout canceled successfully'
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized or payout not pending' })
  @ApiResponse({ status: 404, description: 'Payout not found' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('payout/:id')
  cancelPayout(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.stripeService.cancelPayout(id, userId);
  }

  @ApiOperation({ summary: 'Get current Stripe balance' })
  @ApiResponse({ 
    status: 200, 
    description: 'Balance retrieved',
    schema: {
      example: {
        data: {
          available: {
            amount: 666670,
            currency: 'usd',
          },
          pending: {
            amount: 61414,
            currency: 'usd',
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found or not connected to Stripe' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('balance')
  getBalance(@CurrentUser('userId') userId: string) {
    return this.stripeService.getCurrentBalance(userId);
  }

  @ApiOperation({ summary: 'Handle Stripe webhook event' })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature for verification'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook processed successfully'
  })
  @ApiResponse({ status: 404, description: 'Request body required or webhook processing error' })
  @Post('webhook')
  webhook(
    @Headers('stripe-signature') signature: string, 
    @Req() request: RawBodyRequest<Request> 
  ) {
    const payload = request.rawBody;
    if (!payload) {
      throw new NotFoundException('Request body is required');
    }

    return this.webhookService.handleWebhookEvent(payload, signature);
  }

  @ApiOperation({ summary: 'Retrieve all webhook events (testing only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'All webhook events retrieved',
    schema: {
      example: [
        {
          id: 'webhook_123',
          eventType: 'checkout.session.completed',
          payload: {},
          processed: true,
          createdAt: '2025-05-09T12:34:56.789Z'
        }
      ]
    }
  })
  @Get('webhook')
  webhookTest() {
    return this.webhookService.returnAllWebhooks();
  }
}