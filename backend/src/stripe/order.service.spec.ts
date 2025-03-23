import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import Stripe from 'stripe';

jest.mock('stripe');

describe('OrderService', () => {
  let service: OrderService;
  let prismaService: PrismaService;
  let configService: ConfigService;
  let stripeMock: jest.Mocked<Stripe>;

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'STRIPE_SECRET_KEY': 'test_stripe_key',
        'FRONTEND_URL': 'http://localhost:3000'
      };
      return config[key];
    }),
  };

  beforeEach(async () => {

    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
    

    stripeMock = (Stripe as jest.MockedClass<typeof Stripe>).mock.instances[0] as jest.Mocked<Stripe>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllUserOrders', () => {
    it('should return all orders for a user', async () => {
      const userId = 'user-123';
      const mockOrders = [
        { id: 'order-1', buyerId: userId, productId: 'product-1' },
        { id: 'order-2', buyerId: userId, productId: 'product-2' },
      ];
      
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);
      
      const result = await service.getAllUserOrders(userId);
      
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { buyerId: userId },
        include: { product: true }
      });
      expect(result).toEqual(mockOrders);
    });
  });

  describe('checkoutOrder', () => {
    it('should create a checkout session successfully', async () => {
      
      const productId = 'product-123';
      const userId = 'user-123';
      const sellerId = 'seller-123';
      
      const mockProduct = {
        id: productId,
        title: 'Test Product',
        price: 29.99,
        sellerId,
      };
      
      const mockOrder = {
        id: 'order-123',
        buyerId: userId,
        sellerId,
        productId,
        amount: mockProduct.price * 100,
      };
      
      const mockBuyer = {
        id: userId,
        email: 'buyer@example.com',
      };
      
      const mockSeller = {
        id: sellerId,
        stripeAccount: 'acct_seller123',
      };
      
      const mockSession = {
        id: 'cs_123',
        url: 'https://checkout.stripe.com/c/pay/cs_123',
      };
      
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.order.create.mockResolvedValue(mockOrder);
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce(mockBuyer)
        .mockResolvedValueOnce(mockSeller);
      
      stripeMock.checkout = {
        sessions: {
          create: jest.fn().mockResolvedValue(mockSession),
        },
      } as any;
      
      const result = await service.checkoutOrder(productId, userId);
      
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId }
      });
      
      expect(mockPrismaService.order.create).toHaveBeenCalledWith({
        data: {
          sellerId,
          buyerId: userId,
          productId,
          amount: mockProduct.price * 100,
        }
      });
      
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId }
      });
      
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: sellerId }
      });
      
      expect(stripeMock.checkout.sessions.create).toHaveBeenCalledWith({
        payment_method_types: ['card', 'blik', 'p24', 'klarna'],
        line_items: [
          {
            price_data: {
              currency: 'pln',
              product_data: {
                name: mockProduct.title,
              },
              unit_amount: mockProduct.price * 100,
            },
            quantity: 1,
          }
        ],
        mode: 'payment',
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
        payment_intent_data: {
          application_fee_amount: mockProduct.price * 5,
          transfer_data: {
            destination: mockSeller.stripeAccount
          }
        },
        customer_email: mockBuyer.email,
        billing_address_collection: 'auto',
        metadata: {
          orderId: mockOrder.id,
        }
      });
      
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: mockOrder.id },
        data: { 
          checkoutSessionId: mockSession.id, 
          paymentUrl: mockSession.url
        }
      });
      
      expect(result).toEqual(mockSession);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      
      await expect(service.checkoutOrder('nonexistent-product', 'user-123'))
        .rejects
        .toThrow(NotFoundException);
      
      expect(mockPrismaService.order.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when buyer not found', async () => {
      const productId = 'product-123';
      const userId = 'user-123';
      
      mockPrismaService.product.findUnique.mockResolvedValue({
        id: productId,
        sellerId: 'seller-123',
        price: 29.99,
      });
      
      mockPrismaService.order.create.mockResolvedValue({
        id: 'order-123',
        buyerId: userId,
      });
      
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      
      await expect(service.checkoutOrder(productId, userId))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw NotFoundException when seller not found or not connected to Stripe', async () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const sellerId = 'seller-123';
      
      mockPrismaService.product.findUnique.mockResolvedValue({
        id: productId,
        sellerId,
        price: 29.99,
      });
      
      mockPrismaService.order.create.mockResolvedValue({
        id: 'order-123',
        buyerId: userId,
      });
      
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce({ id: userId, email: 'buyer@example.com' })
        .mockResolvedValueOnce({ id: sellerId, stripeAccount: null });
      
      await expect(service.checkoutOrder(productId, userId))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw NotFoundException on Stripe error', async () => {
      const productId = 'product-123';
      const userId = 'user-123';
      const sellerId = 'seller-123';
      
      mockPrismaService.product.findUnique.mockResolvedValue({
        id: productId,
        sellerId,
        title: 'Test Product',
        price: 29.99,
      });
      
      mockPrismaService.order.create.mockResolvedValue({
        id: 'order-123',
        buyerId: userId,
      });
      
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce({ id: userId, email: 'buyer@example.com' })
        .mockResolvedValueOnce({ id: sellerId, stripeAccount: 'acct_seller123' });
      
      stripeMock.checkout = {
        sessions: {
          create: jest.fn().mockRejectedValue(new Error('Stripe API error')),
        },
      } as any;
      
      await expect(service.checkoutOrder(productId, userId))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('createRefund', () => {
    it('should create a refund successfully', async () => {
      const orderId = 'order-123';
      const userId = 'user-123';
      const mockOrder = {
        id: orderId,
        buyerId: userId,
        productId: 'product-123',
        amount: 2999,
        checkoutSessionId: 'cs_123',
        createdAt: new Date(),
      };
      
      const mockCheckoutSession = {
        payment_intent: 'pi_123',
      };
      
      const mockRefund = {
        id: 're_123',
        status: 'succeeded',
      };
      
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.product.findUnique.mockResolvedValue({ id: 'product-123' });
      
      stripeMock.checkout = {
        sessions: {
          retrieve: jest.fn().mockResolvedValue(mockCheckoutSession),
        },
      } as any;
      
      stripeMock.refunds = {
        create: jest.fn().mockResolvedValue(mockRefund),
      } as any;
      
      const result = await service.createRefund(orderId, userId);
      
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId }
      });
      
      expect(stripeMock.checkout.sessions.retrieve).toHaveBeenCalledWith(mockOrder.checkoutSessionId);
      
      expect(stripeMock.refunds.create).toHaveBeenCalledWith({
        payment_intent: mockCheckoutSession.payment_intent.toString(),
        amount: mockOrder.amount,
        metadata: { orderId: mockOrder.id }
      });
      
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: 'REFUNDED' }
      });
      
      expect(result).toEqual(mockRefund);
    });

    it('should throw NotFoundException when order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);
      
      await expect(service.createRefund('nonexistent-order', 'user-123'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw NotFoundException when order belongs to a different user', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-123',
        buyerId: 'different-user',
        checkoutSessionId: 'cs_123',
      });
      
      await expect(service.createRefund('order-123', 'user-123'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when refund period has expired', async () => {
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-123',
        buyerId: 'user-123',
        checkoutSessionId: 'cs_123',
        createdAt: fifteenDaysAgo,
      });
      
      await expect(service.createRefund('order-123', 'user-123'))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException when payment intent not found', async () => {
      const orderId = 'order-123';
      const userId = 'user-123';
      
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: orderId,
        buyerId: userId,
        checkoutSessionId: 'cs_123',
        createdAt: new Date(), // Today
      });
      
      stripeMock.checkout = {
        sessions: {
          retrieve: jest.fn().mockResolvedValue({
          }),
        },
      } as any;
      
      await expect(service.createRefund(orderId, userId))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw NotFoundException when product not found', async () => {
      const orderId = 'order-123';
      const userId = 'user-123';
      
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: orderId,
        buyerId: userId,
        productId: 'product-123',
        checkoutSessionId: 'cs_123',
        createdAt: new Date(),
      });
      
      stripeMock.checkout = {
        sessions: {
          retrieve: jest.fn().mockResolvedValue({
            payment_intent: 'pi_123',
          }),
        },
      } as any;
      
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      
      await expect(service.createRefund(orderId, userId))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw NotFoundException on Stripe error during refund', async () => {
      const orderId = 'order-123';
      const userId = 'user-123';
      
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: orderId,
        buyerId: userId,
        productId: 'product-123',
        amount: 2999,
        checkoutSessionId: 'cs_123',
        createdAt: new Date(),
      });
      
      mockPrismaService.product.findUnique.mockResolvedValue({ id: 'product-123' });
      
      stripeMock.checkout = {
        sessions: {
          retrieve: jest.fn().mockResolvedValue({
            payment_intent: 'pi_123',
          }),
        },
      } as any;
      
      stripeMock.refunds = {
        create: jest.fn().mockRejectedValue(new Error('Stripe API error')),
      } as any;
      
      await expect(service.createRefund(orderId, userId))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});