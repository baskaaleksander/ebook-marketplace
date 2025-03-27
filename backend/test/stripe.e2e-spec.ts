import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { setupTestDatabase, cleanupTestDatabase } from './test-setup';
import { createUserAndLogin } from './auth.helper';
import { StripeService } from '../src/stripe/stripe.service';
import { OrderService } from '../src/stripe/order.service';
import { WebhookService } from '../src/stripe/webhook.service';
import { createStripeMock } from './mocks/stripe.mock';
import { ConfigService } from '@nestjs/config';

describe('StripeController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let testProductId: string;
  let stripeMock: ReturnType<typeof createStripeMock>;
  let userId: string;

  beforeAll(async () => {
    prismaService = await setupTestDatabase();
    stripeMock = createStripeMock();
    
    const mockConfigService = {
      get: (key: string) => {
        if (key === 'STRIPE_SECRET_KEY') return 'sk_test_mock';
        if (key === 'STRIPE_WEBHOOK_SECRET') return 'whsec_mock';
        if (key === 'FRONTEND_URL') return 'http://localhost:3000';
        return process.env[key];
      }
    };
    
    const stripeServiceFactory = {
      provide: StripeService,
      factory: () => {
        const service = new StripeService(mockConfigService as ConfigService, prismaService);
        // @ts-ignore - Replace the private Stripe instance with our mock
        service.stripe = stripeMock;
        return service;
      }
    };
    
    const orderServiceFactory = {
      provide: OrderService,
      factory: () => {
        const service = new OrderService(prismaService, mockConfigService as ConfigService);
        // @ts-ignore - Replace the private Stripe instance with our mock
        service.stripe = stripeMock;
        return service;
      }
    };
    
    const webhookServiceFactory = {
      provide: WebhookService,
      factory: () => {
        const service = new WebhookService(mockConfigService as ConfigService, prismaService);
        // @ts-ignore - Replace the private Stripe instance with our mock
        service.stripe = stripeMock;
        return service;
      }
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .overrideProvider(StripeService)
      .useFactory(stripeServiceFactory)
      .overrideProvider(OrderService)
      .useFactory(orderServiceFactory)
      .overrideProvider(WebhookService)
      .useFactory(webhookServiceFactory)
      .compile();

    app = moduleFixture.createNestApplication();
    
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ 
      whitelist: true,
      transform: true
    }));
    app.enableCors({
      origin: true,
      credentials: true,
    });
    
    await app.init();

    const { user, token } = await createUserAndLogin(app, prismaService);
    authToken = token;
    
    if (!authToken) {
      throw new Error('Failed to obtain authentication token for tests');
    }
  });

  beforeEach(async () => {
    await cleanupTestDatabase(prismaService);
    prismaService = await setupTestDatabase();

    const { user, token } = await createUserAndLogin(app, prismaService);
    authToken = token;
    userId = user.id;
    
    const productResponse = await request(app.getHttpServer())
      .post('/listing')
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        title: 'E2E Test E-book for Stripe',
        description: 'Created during Stripe E2E testing',
        price: 14.99,
        fileUrl: 'https://example.com/test-stripe-file.pdf',
        categories: [{ name: 'Testing' }]
      });
    
    testProductId = productResponse.body.id;


  });
  
  afterAll(async () => {
    await cleanupTestDatabase(prismaService);
    await app.close();
  });

  it('/checkout (POST) - should create a checkout session', async () => {

    await prismaService.user.update({
      where: { id: userId },
      data: { 
        stripeAccount: 'acct_mock123',
        stripeStatus: 'verified'
      }
    });

    return request(app.getHttpServer())
      .post('/stripe/order/checkout')
      .set('Cookie', [`jwt=${authToken}`])
      .send({ id: testProductId })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('url');
        expect(res.body.url).toContain('checkout.stripe.com');
        
        expect(stripeMock.checkout.sessions.create).toHaveBeenCalled();
      });
  });
  it('/connect (POST) - should connect a Stripe account', async () => {
    return request(app.getHttpServer())
      .post('/stripe/connect')
      .set('Cookie', [`jwt=${authToken}`])
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('url');
        expect(stripeMock.accounts.create).toHaveBeenCalled();
        expect(stripeMock.accountLinks.create).toHaveBeenCalled();
      });
  });

  it('/balance (GET) - should return current balance', async () => {

    await prismaService.user.update({
      where: { id: userId },
      data: { 
        stripeAccount: 'acct_mock123',
        stripeStatus: 'verified'
      }
    });

    return request(app.getHttpServer())
      .get('/stripe/balance')
      .set('Cookie', [`jwt=${authToken}`])
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('available');
        expect(stripeMock.balance.retrieve).toHaveBeenCalled();
      });
  });

  it('/payout (POST) - should create a payout', async () => {

    await prismaService.user.update({
      where: { id: userId },
      data: { 
        stripeAccount: 'acct_mock123',
        stripeStatus: 'verified'
      }
    });

    return request(app.getHttpServer())
      .post('/stripe/payout')
      .set('Cookie', [`jwt=${authToken}`])
      .send({ amount: 1000 })
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toBe('Payout created');
        expect(stripeMock.payouts.create).toHaveBeenCalled();
      });
  });

  it('/refund (POST) - should create a refund', async () => {

    await prismaService.user.update({
      where: { id: userId },
      data: { 
        stripeAccount: 'acct_mock123',
        stripeStatus: 'verified'
      }
    });

    const order = await prismaService.order.create({
      data: {
        buyerId: userId,
        sellerId: userId,
        productId: testProductId,
        amount: 1499,
        status: 'COMPLETED',
        checkoutSessionId: 'cs_test_mockSessionId',
        createdAt: new Date()
      }
    });


    stripeMock.checkout.sessions.retrieve.mockResolvedValue({
      id: 'cs_test_mockSessionId',
      payment_intent: 'pi_test_mockPaymentIntent'
    });

    return request(app.getHttpServer())
      .post('/stripe/order/refund')
      .set('Cookie', [`jwt=${authToken}`])
      .send({ id: order.id })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', 're_mock123');
        expect(stripeMock.refunds.create).toHaveBeenCalled();
      });
  });
});