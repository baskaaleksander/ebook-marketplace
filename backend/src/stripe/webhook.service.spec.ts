import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { WebhookService } from './webhook.service';
import Stripe from 'stripe';

jest.mock('stripe');

describe('StripeService', () => {
  let service: WebhookService;
  let stripeService: StripeService;
  let prismaService: PrismaService;
  let configService: ConfigService;
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

    (Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => stripeMock as any);    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

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
  });
});


