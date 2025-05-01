import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { WebhookService } from './webhook.service';
import Stripe from 'stripe';
import { FeaturedService } from './featured.service';

jest.mock('stripe');

describe('WebhookService', () => {
    let service: WebhookService;
    let stripeService: StripeService;
    let prismaService: PrismaService;
    let configService: ConfigService;
    let featuredService: FeaturedService;
    let stripe: Stripe;
    let stripeMock: {
        webhooks: {
            constructEvent: jest.Mock;
        };
        accounts: {
            create: jest.Mock;
            retrieve: jest.Mock;
            del: jest.Mock;
        };
        accountLinks: {
            create: jest.Mock;
        };
        balance: {
            retrieve: jest.Mock;
        };
        payouts: {
            create: jest.Mock;
            retrieve: jest.Mock;
            cancel: jest.Mock;
        };
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'STRIPE_SECRET_KEY') return 'test_key';
            if (key === 'FRONTEND_URL') return 'http://localhost:3000';
            if (key === 'STRIPE_WEBHOOK_SECRET') return 'test_webhook_secret';
            return null;
        }),
    };

    const mockPrismaService = {
        webhookEvent: {
            create: jest.fn(),
            updateMany: jest.fn(),
            findMany: jest.fn(),
        },
        order: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        refund: {
            update: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        payout: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    };

    let mockFeaturedService = {
        markAsFeatured: jest.fn(),
        checkoutFeaturing: jest.fn(),
    }

    beforeEach(async () => {
        jest.clearAllMocks();

        stripeMock = {
            webhooks: {
                constructEvent: jest.fn(),
            },
            accounts: {
                create: jest.fn(),
                retrieve: jest.fn(),
                del: jest.fn(),
            },
            accountLinks: {
                create: jest.fn(),
            },
            balance: {
                retrieve: jest.fn(),
            },
            payouts: {
                create: jest.fn(),
                retrieve: jest.fn(),
                cancel: jest.fn(),
            },
        };

        (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
            if (key === 'STRIPE_SECRET_KEY') return 'test_key';
            if (key === 'FRONTEND_URL') return 'http://localhost:3000';
            if (key === 'STRIPE_WEBHOOK_SECRET') return 'test_webhook_secret';
            return null;
        });

        (Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => stripeMock as any);    
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WebhookService,
                { provide: ConfigService, useValue: mockConfigService },
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: FeaturedService, useValue: mockFeaturedService },
            ],
        }).compile();

        service = module.get<WebhookService>(WebhookService);
        prismaService = module.get<PrismaService>(PrismaService);
        configService = module.get<ConfigService>(ConfigService);
        featuredService = module.get<FeaturedService>(FeaturedService);

        stripe = new Stripe('test_key')
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('verifyWebhookSignature', () => {
        it('should verify the webhook signature and return the event', () => {
            const mockEvent = {
                id: 'evt_123',
                object: 'event',
                created: Date.now(),
                data: { object: {} },
                livemode: false,
                pending_webhooks: 0,
                request: null,
                type: 'checkout.session.completed',
                api_version: '2025-02-24.acacia',
            } as unknown as Stripe.Event;

            const constructEventMock = stripe.webhooks.constructEvent as jest.MockedFunction<
                typeof stripe.webhooks.constructEvent
            >;

            constructEventMock.mockReturnValue(mockEvent);

            const payload = Buffer.from('test_payload');
            const signature = 'test_signature';
            const result = service.verifyWebhookSignature(payload, signature);

            expect(result).toEqual(mockEvent);
            expect(constructEventMock).toHaveBeenCalledWith(
                payload,
                signature,
                'test_webhook_secret'
            );
        });

        it('should throw an error if stripe_webhook_key is not defined', () => {
            (mockConfigService.get as jest.Mock).mockReturnValue(null);

            expect(() => service.verifyWebhookSignature(Buffer.from('test_payload'), 'test_signature')).toThrowError(
                'STRIPE_WEBHOOK_SECRET is not defined'
            );
        });

        it('should throw an error if stripe_secret_key is not defined', () => {
            jest.resetModules();
            (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
                if (key === 'STRIPE_SECRET_KEY') return null;
                if (key === 'FRONTEND_URL') return 'http://localhost:3000';
                if (key === 'STRIPE_WEBHOOK_SECRET') return 'test_webhook_secret';
                return null;
            });
            
            expect(() => {
                const newService = new WebhookService(mockConfigService as any, mockPrismaService as any, featuredService as any);
            }).toThrowError('STRIPE_SECRET_KEY is not defined');
        });

        it('should throw an error if the signature is invalid', () => {
            const payload = Buffer.from('test_payload');
            const signature = 'test_signature';
            const constructEventMock = stripe.webhooks.constructEvent as jest.MockedFunction<
                typeof stripe.webhooks.constructEvent
            >;
            constructEventMock.mockImplementation(() => {
                throw new Error('Invalid signature');
            });

            expect(() => service.verifyWebhookSignature(payload, signature)).toThrowError('Webhook signature verification failed');
        });

        it('should process the webhook event and update the processed status', async () => {
            const mockEvent = {
                id: 'evt_123',
                object: 'event',
                created: Date.now(),
                data: { 
                    object: {
                        metadata: {
                            orderId: 'order123'
                        }
                    } 
                },
                livemode: false,
                pending_webhooks: 0,
                request: null,
                type: 'checkout.session.completed',
                api_version: '2025-02-24.acacia',
            } as unknown as Stripe.Event;
        
            jest.spyOn(service, 'handleCheckoutSessionCompleted').mockResolvedValue(undefined);
            
            const updateManyMock = prismaService.webhookEvent.updateMany as jest.Mock;
        
            await service.processWebhookEvent(mockEvent);
        
            expect(updateManyMock).toHaveBeenCalledWith({
                where: { id: mockEvent.id },
                data: { processed: true },
            });
        });

        it('should handle the checkout session completed event', async () => {
            const mockEvent = {
                id: 'evt_123',
                object: 'event',
                created: Date.now(),
                data: { 
                    object: {
                        metadata: {
                            orderId: 'order123'
                        }
                    } 
                },
                livemode: false,
                pending_webhooks: 0,
                request: null,
                type: 'checkout.session.completed',
                api_version: '2025-02-24.acacia',
            } as unknown as Stripe.Event;
        
            const findUniqueMock = prismaService.order.findUnique as jest.Mock;
            findUniqueMock.mockResolvedValue({
                id: 'order123',
                sellerId: 'seller123',
                buyerId: 'buyer123',
                productId: 'product123',
                amount: 100,
            });
        
            const updateMock = prismaService.order.update as jest.Mock;
            updateMock.mockResolvedValue({
                id: 'order123',
                sellerId: 'seller123',
                buyerId: 'buyer123',
                productId: 'product123',
                amount: 100,
                status: 'COMPLETED',
            });
        
            await service.handleCheckoutSessionCompleted(mockEvent);
        
            expect(findUniqueMock).toHaveBeenCalledWith({
                where: { id: 'order123' },
            });
        
            expect(updateMock).toHaveBeenCalledWith({
                where: { id: 'order123' },
                data: { status: 'COMPLETED' },
            });
        });

        it('should handle the payment intent failed event', async () => {
            const mockEvent = {
                id: 'evt_123',
                object: 'event',
                created: Date.now(),
                data: { 
                    object: {
                        metadata: {
                            orderId: 'order123'
                        }
                    } 
                },
                livemode: false,
                pending_webhooks: 0,
                request: null,
                type: 'payment_intent.payment_failed',
                api_version: '2025-02-24.acacia',
            } as unknown as Stripe.Event;

            const findUniqueMock = prismaService.order.findUnique as jest.Mock;
            findUniqueMock.mockResolvedValue({
                id: 'order123',
                sellerId: 'seller123',
                buyerId: 'buyer123',
                productId: 'product123',
                amount: 100,
            });

            const updateMock = prismaService.order.update as jest.Mock;
            updateMock.mockResolvedValue({
                id: 'order123',
                sellerId: 'seller123',
                buyerId: 'buyer123',
                productId: 'product123',
                amount: 100,
                status: 'FAILED',
            });

            await service.handlePaymentIntentFailed(mockEvent);

            expect(findUniqueMock).toHaveBeenCalledWith({
                where: { id: 'order123' },
            });

            expect(updateMock).toHaveBeenCalledWith({
                where: { id: 'order123' },
                data: { status: 'FAILED' },
            });
        });

        it('should throw an error if the order is not found', async () => {
            const mockEvent = {
                id: 'evt_123',
                object: 'event',
                created: Date.now(),
                data: { 
                    object: {
                        metadata: {
                            orderId: 'order123'
                        }
                    } 
                },
                livemode: false,
                pending_webhooks: 0,
                request: null,
                type: 'checkout.session.completed',
                api_version: '2025-02-24.acacia',
            } as unknown as Stripe.Event;
        
            const findUniqueMock = prismaService.order.findUnique as jest.Mock;
            findUniqueMock.mockResolvedValue(null);
        
            await expect(service.handleCheckoutSessionCompleted(mockEvent)).rejects.toThrowError(
                'Order not found'
            );
        });
    
        it('should throw NotFoundException if refund metadata is missing in handleRefundCompleted', async () => {
            const mockEvent = {
                id: 'evt_123',
                object: 'event',
                created: Date.now(),
                data: { 
                    object: {
                    } 
                },
                livemode: false,
                pending_webhooks: 0,
                request: null,
                type: 'charge.refunded',
                api_version: '2025-02-24.acacia',
            } as unknown as Stripe.Event;
        
            const findUniqueMock = prismaService.order.findUnique as jest.Mock;
            findUniqueMock.mockResolvedValue(null);
        
            await expect(service.handleRefundCompleted(mockEvent)).rejects.toThrowError(
                'Refund metadata not found'
            );
        });

        it('should create a new webhook event and process it', async () => {
            const mockEvent = {
                id: 'evt_123',
                object: 'event',
                created: Date.now(),
                data: { 
                    object: {
                        metadata: {
                            orderId: 'order123'
                        }
                    } 
                },
                livemode: false,
                pending_webhooks: 0,
                request: null,
                type: 'checkout.session.completed',
                api_version: '2025-02-24.acacia',
            } as unknown as Stripe.Event;
        
            const constructEventMock = stripe.webhooks.constructEvent as jest.MockedFunction<
                typeof stripe.webhooks.constructEvent
            >;
            constructEventMock.mockReturnValue(mockEvent);
        
            jest.spyOn(service, 'processWebhookEvent').mockResolvedValue(undefined);
        
            const createMock = prismaService.webhookEvent.create as jest.Mock;
            createMock.mockResolvedValue({
                id: 'webhook_123',
                eventType: mockEvent.type,
                payload: JSON.parse(JSON.stringify(mockEvent)),
                processed: false
            });
        
            const result = await service.handleWebhookEvent(Buffer.from('test_payload'), 'test_signature');
        
            expect(constructEventMock).toHaveBeenCalledWith(
                Buffer.from('test_payload'),
                'test_signature',
                'test_webhook_secret'
            );
            
            expect(createMock).toHaveBeenCalledWith({
                data: {
                    eventType: mockEvent.type,
                    payload: JSON.parse(JSON.stringify(mockEvent)),
                    processed: false,
                },
            });
            
            expect(service.processWebhookEvent).toHaveBeenCalledWith(mockEvent);
        });
    });
});
