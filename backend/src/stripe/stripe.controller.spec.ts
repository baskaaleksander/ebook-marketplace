import { Test, TestingModule } from '@nestjs/testing';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { WebhookService } from './webhook.service';
import { OrderService } from './order.service';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { IdDto } from '../dtos/id.dto';
import { AmountDto } from './dtos/amount.dto';
import { FeaturedService } from './featured.service';

describe('StripeController', () => {
  let controller: StripeController;
  let stripeService: StripeService;
  let webhookService: WebhookService;
  let orderService: OrderService;
  let featuredService: FeaturedService;

  const mockStripeService = {
    connectAccount: jest.fn(),
    checkAccountStatus: jest.fn(),
    disconnectAccount: jest.fn(),
    createPayout: jest.fn(),
    getPayout: jest.fn(),
    cancelPayout: jest.fn(),
    getCurrentBalance: jest.fn(),
    getAllUserPayouts: jest.fn(),
  };

  const mockWebhookService = {
    handleWebhookEvent: jest.fn(),
    returnAllWebhooks: jest.fn(),
    processWebhookEvent: jest.fn(),
  };

  const mockOrderService = {
    checkoutOrder: jest.fn(),
    createRefund: jest.fn(),
    getAllUserOrders: jest.fn(),
    getAllSoldOrders: jest.fn(),
  };

  const mockFeaturedService = {
    markAsFeatured: jest.fn(),
    checkoutFeaturing: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeController],
      providers: [
        { provide: StripeService, useValue: mockStripeService },
        { provide: WebhookService, useValue: mockWebhookService },
        { provide: OrderService, useValue: mockOrderService },
        { provide: FeaturedService, useValue: mockFeaturedService },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = { userId: 'test-user-id' };
          return true;
        },
      })
      .compile();

    controller = module.get<StripeController>(StripeController);
    stripeService = module.get<StripeService>(StripeService);
    webhookService = module.get<WebhookService>(WebhookService);
    orderService = module.get<OrderService>(OrderService);
    featuredService = module.get<FeaturedService>(FeaturedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('connectAccount', () => {
    it('should call StripeService.connectAccount with userId', async () => {
      mockStripeService.connectAccount.mockResolvedValue({ url: 'test-url' });

      const result = await controller.connectAccount('test-user-id');

      expect(mockStripeService.connectAccount).toHaveBeenCalledWith('test-user-id');
      expect(result).toEqual({ url: 'test-url' });
    });
  });

  describe('getAccountDetails', () => {
    it('should call StripeService.checkAccountStatus with account id', async () => {
      mockStripeService.checkAccountStatus.mockResolvedValue({ id: 'acct_123', charges_enabled: true });

      const result = await controller.getAccountDetails('acct_123');

      expect(mockStripeService.checkAccountStatus).toHaveBeenCalledWith('acct_123');
      expect(result).toEqual({ id: 'acct_123', charges_enabled: true });
    });
  });

  describe('disconnectAccount', () => {
    it('should call StripeService.disconnectAccount with userId', async () => {
      mockStripeService.disconnectAccount.mockResolvedValue('Account disconnected');

      const result = await controller.disconnectAccount('test-user-id');

      expect(mockStripeService.disconnectAccount).toHaveBeenCalledWith('test-user-id');
      expect(result).toEqual('Account disconnected');
    });
  });

  describe('checkoutOrder', () => {
    it('should call OrderService.checkoutOrder with order id and userId', async () => {
      const idDto: IdDto = { id: 'order123' };
      mockOrderService.checkoutOrder.mockResolvedValue({ success: true });

      const result = await controller.checkoutOrder(idDto, 'test-user-id');

      expect(mockOrderService.checkoutOrder).toHaveBeenCalledWith('order123', 'test-user-id');
      expect(result).toEqual({ success: true });
    });
  });

  describe('cancelOrder', () => {
    it('should call OrderService.createRefund with order id and userId', async () => {
      const idDto: IdDto = { id: 'order123' };
      mockOrderService.createRefund.mockResolvedValue({ success: true });

      const result = await controller.cancelOrder(idDto, 'test-user-id');

      expect(mockOrderService.createRefund).toHaveBeenCalledWith('order123', 'test-user-id');
      expect(result).toEqual({ success: true });
    });
  });

  describe('getAllUserOrders', () => {
    it('should call OrderService.getAllUserOrders with userId', async () => {
      mockOrderService.getAllUserOrders.mockResolvedValue([{ id: 'order123' }]);

      const result = await controller.getAllUserOrders('test-user-id');

      expect(mockOrderService.getAllUserOrders).toHaveBeenCalledWith('test-user-id');
      expect(result).toEqual([{ id: 'order123' }]);
    });
  });

  describe('payout', () => {
    it('should call StripeService.createPayout with amount and userId', async () => {
      const amountDto: AmountDto = { amount: 1000 };
      mockStripeService.createPayout.mockResolvedValue({ success: true });

      const result = await controller.payout(amountDto, 'test-user-id');

      expect(mockStripeService.createPayout).toHaveBeenCalledWith(1000, 'test-user-id');
      expect(result).toEqual({ success: true });
    });
  });

  describe('getPayout', () => {
    it('should call StripeService.getPayout with payout id and userId', async () => {
      mockStripeService.getPayout.mockResolvedValue({ id: 'payout123', amount: 1000 });

      const result = await controller.getPayout('payout123', 'test-user-id');

      expect(mockStripeService.getPayout).toHaveBeenCalledWith('payout123', 'test-user-id');
      expect(result).toEqual({ id: 'payout123', amount: 1000 });
    });
  });

  describe('cancelPayout', () => {
    it('should call StripeService.cancelPayout with payout id and userId', async () => {
      mockStripeService.cancelPayout.mockResolvedValue({ success: true });

      const result = await controller.cancelPayout('payout123', 'test-user-id');

      expect(mockStripeService.cancelPayout).toHaveBeenCalledWith('payout123', 'test-user-id');
      expect(result).toEqual({ success: true });
    });
  });

  describe('getBalance', () => {
    it('should call StripeService.getCurrentBalance with userId', async () => {
      mockStripeService.getCurrentBalance.mockResolvedValue({ available: 1000 });

      const result = await controller.getBalance('test-user-id');

      expect(mockStripeService.getCurrentBalance).toHaveBeenCalledWith('test-user-id');
      expect(result).toEqual({ available: 1000 });
    });
  });

  describe('webhook', () => {
    it('should call WebhookService.handleWebhookEvent with payload and signature', async () => {
      const mockRequest = {
        rawBody: 'test-payload',
      } as any;
      const signature = 'test-signature';
      mockWebhookService.handleWebhookEvent.mockResolvedValue({ success: true });

      const result = await controller.webhook(signature, mockRequest);

      expect(mockWebhookService.handleWebhookEvent).toHaveBeenCalledWith('test-payload', signature);
      expect(result).toEqual({ success: true });
    });

  });

  describe('webhookTest', () => {
    it('should call WebhookService.returnAllWebhooks', async () => {
      mockWebhookService.returnAllWebhooks.mockResolvedValue([{ id: 'webhook123' }]);

      const result = await controller.webhookTest();

      expect(mockWebhookService.returnAllWebhooks).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'webhook123' }]);
    });
  });
});