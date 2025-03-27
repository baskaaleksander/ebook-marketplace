import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import * as cookieParser from 'cookie-parser';
import { createUserAndLogin } from './auth.helper';
import { setupTestDatabase, cleanupTestDatabase } from './test-setup';

describe('ListingController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let createdListingId: string;
  let createdReviewId: string;

  beforeAll(async () => {
    prismaService = await setupTestDatabase();
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(PrismaService)
    .useValue(prismaService)
    .compile();

    app = moduleFixture.createNestApplication();
    
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    
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
  });
  
  afterAll(async () => {
    await cleanupTestDatabase(prismaService);
    await app.close();
  });

  it('/listing (POST) - should create a new listing', () => {
    request(app.getHttpServer())
      .post('/listing')
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        title: 'E2E Test E-book',
        description: 'Created during E2E testing',
        price: 14.99,
        fileUrl: 'https://example.com/test-file.pdf',
        categories: [{ name: 'Testing' }]
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe('E2E Test E-book');
      });
  });

  it('/listing (GET) - should return listings', async () => {
    await request(app.getHttpServer())
      .post('/listing')
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        title: 'E2E Test E-book',
        description: 'Created during E2E testing',
        price: 14.99,
        fileUrl: 'https://example.com/test-file.pdf',
        categories: [{ name: 'Testing' }]
      });
    const response = request(app.getHttpServer())
      .get('/listing')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/listing/:id (GET) - should return a specific listing', async () => {
    const response = await request(app.getHttpServer())
      .post('/listing')
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        title: 'E2E Test E-book',
        description: 'Created during E2E testing',
        price: 14.99,
        fileUrl: 'https://example.com/test-file.pdf',
        categories: [{ name: 'Testing' }]
      });

    return request(app.getHttpServer())
      .get(`/listing/${response.body.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', response.body.id);
        expect(res.body).toHaveProperty('title', 'E2E Test E-book');
      });
  });

  it('/listing/:id (PUT) - should update a listing', async () => {
    const response = await request(app.getHttpServer())
      .post('/listing')
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        title: 'E2E Test E-book',
        description: 'Created during E2E testing',
        price: 14.99,
        fileUrl: 'https://example.com/test-file.pdf',
        categories: [{ name: 'Testing' }]
      });

    return request(app.getHttpServer())
      .put(`/listing/${response.body.id}`)
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        title: 'Updated E2E Test E-book',
        price: 19.99
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', response.body.id);
        expect(res.body).toHaveProperty('title', 'Updated E2E Test E-book');
        expect(res.body).toHaveProperty('price', 19.99);
      });
  });

  it(':id/reviews (POST) - should create a review', async () => {
    const response = await request(app.getHttpServer())
      .post('/listing')
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        title: 'E2E Test E-book',
        description: 'Created during E2E testing',
        price: 14.99,
        fileUrl: 'https://example.com/test-file.pdf',
        categories: [{ name: 'Testing' }]
      });

    const testUser = await prismaService.user.findUnique({
      where: { email: 'e2e-test@example.com' }
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }
    
    const order = await prismaService.order.create({
      data: {
        buyerId: testUser.id,
        productId: response.body.id,
        amount: 14.99,
        status: 'COMPLETED',
        checkoutSessionId: 'test-session-id'
      }
    });

    return request(app.getHttpServer())
      .post(`/listing/${response.body.id}/reviews`)
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        rating: 5,
        comment: 'Great book!'
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('rating', 5);
        expect(res.body).toHaveProperty('comment', 'Great book!');
      });
  });

  it(':id/reviews/ (GET) - should return reviews for a listing', async () => {
    const response = await request(app.getHttpServer())
      .post('/listing')
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        title: 'E2E Test E-book',
        description: 'Created during E2E testing',
        price: 14.99,
        fileUrl: 'https://example.com/test-file.pdf',
        categories: [{ name: 'Testing' }]
      });

    const testUser = await prismaService.user.findUnique({
      where: { email: 'e2e-test@example.com' }
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }
    
    const order = await prismaService.order.create({
      data: {
        buyerId: testUser.id,
        productId: response.body.id,
        amount: 14.99,
        status: 'COMPLETED',
        checkoutSessionId: 'test-session-id'
      }
    });

    await request(app.getHttpServer())
      .post(`/listing/${response.body.id}/reviews`)
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        rating: 5,
        comment: 'Great book!'
      });

    return request(app.getHttpServer())
      .get(`/listing/${response.body.id}/reviews`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
      });
  });

  it('reviews/:reviewId (GET) - should return a specific review', async () => {
    const response = await request(app.getHttpServer())
      .post('/listing')
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        title: 'E2E Test E-book',
        description: 'Created during E2E testing',
        price: 14.99,
        fileUrl: 'https://example.com/test-file.pdf',
        categories: [{ name: 'Testing' }]
      });

    const testUser = await prismaService.user.findUnique({
      where: { email: 'e2e-test@example.com' }
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }
    
    const order = await prismaService.order.create({
      data: {
        buyerId: testUser.id,
        productId: response.body.id,
        amount: 14.99,
        status: 'COMPLETED',
        checkoutSessionId: 'test-session-id'
      }
    });

    const reviewResponse = await request(app.getHttpServer())
      .post(`/listing/${response.body.id}/reviews`)
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        rating: 5,
        comment: 'Great book!'
      });

    return request(app.getHttpServer())
      .get(`/listing/reviews/${reviewResponse.body.id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', reviewResponse.body.id);
        expect(res.body).toHaveProperty('rating', 5);
        expect(res.body).toHaveProperty('comment', 'Great book!');
      });
  });

  it('reviews/:reviewId (PUT) - should update a review', async () => {
    const response = await request(app.getHttpServer())
      .post('/listing')
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        title: 'E2E Test E-book',
        description: 'Created during E2E testing',
        price: 14.99,
        fileUrl: 'https://example.com/test-file.pdf',
        categories: [{ name: 'Testing' }]
      });

    const testUser = await prismaService.user.findUnique({
      where: { email: 'e2e-test@example.com' }
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }
    
    const order = await prismaService.order.create({
      data: {
        buyerId: testUser.id,
        productId: response.body.id,
        amount: 14.99,
        status: 'COMPLETED',
        checkoutSessionId: 'test-session-id'
      }
    });

    const reviewResponse = await request(app.getHttpServer())
      .post(`/listing/${response.body.id}/reviews`)
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        rating: 5,
        comment: 'Great book!'
      });

    return request(app.getHttpServer())
      .put(`/listing/reviews/${reviewResponse.body.id}`)
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        rating: 4,
        comment: 'Good book!'
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', reviewResponse.body.id);
        expect(res.body).toHaveProperty('rating', 4);
        expect(res.body).toHaveProperty('comment', 'Good book!');
      });
  });

  it('reviews/:reviewId (DELETE) - should delete a review', async () => {
    const response = await request(app.getHttpServer())
      .post('/listing')
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        title: 'E2E Test E-book',
        description: 'Created during E2E testing',
        price: 14.99,
        fileUrl: 'https://example.com/test-file.pdf',
        categories: [{ name: 'Testing' }]
      });

    const testUser = await prismaService.user.findUnique({
      where: { email: 'e2e-test@example.com' }
    });

    if (!testUser) {
      throw new Error('Test user not found');
    }
    
    const order = await prismaService.order.create({
      data: {
        buyerId: testUser.id,
        productId: response.body.id,
        amount: 14.99,
        status: 'COMPLETED',
        checkoutSessionId: 'test-session-id'
      }
    });

    const reviewResponse = await request(app.getHttpServer())
      .post(`/listing/${response.body.id}/reviews`)
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        rating: 5,
        comment: 'Great book!'
      });

    return request(app.getHttpServer())
      .delete(`/listing/reviews/${reviewResponse.body.id}`)
      .set('Cookie', [`jwt=${authToken}`])
      .expect(200);
  });
  
  it('favourites/:id (POST) - should add a listing to favorites', async () => {
    const response = await request(app.getHttpServer())
      .post('/listing')
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        title: 'E2E Test E-book',
        description: 'Created during E2E testing',
        price: 14.99,
        fileUrl: 'https://example.com/test-file.pdf',
        categories: [{ name: 'Testing' }]
      });

    return request(app.getHttpServer())
      .post(`/listing/favourites/${response.body.id}`)
      .set('Cookie', [`jwt=${authToken}`])
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('productId', response.body.id);
      });
  });

  it('favourites (GET) - should return user favorites', async () => {
    const response = await request(app.getHttpServer())
      .post('/listing')
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        title: 'E2E Test E-book',
        description: 'Created during E2E testing',
        price: 14.99,
        fileUrl: 'https://example.com/test-file.pdf',
        categories: [{ name: 'Testing' }]
      });

    await request(app.getHttpServer())
      .post(`/listing/favourites/${response.body.id}`)
      .set('Cookie', [`jwt=${authToken}`])
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('productId', response.body.id);
      });

    return request(app.getHttpServer())
      .get('/listing/favourites')
      .set('Cookie', [`jwt=${authToken}`])
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('favourites/:id (DELETE) - should remove a favorite', async () => {
    const response = await request(app.getHttpServer())
      .post('/listing')
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        title: 'E2E Test E-book',
        description: 'Created during E2E testing',
        price: 14.99,
        fileUrl: 'https://example.com/test-file.pdf',
        categories: [{ name: 'Testing' }]
      });

    await request(app.getHttpServer())
      .post(`/listing/favourites/${response.body.id}`)
      .set('Cookie', [`jwt=${authToken}`])
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('productId', response.body.id);
      });
      
    return request(app.getHttpServer())
      .delete(`/listing/favourites/${response.body.id}`)
      .set('Cookie', [`jwt=${authToken}`])
      .expect(200);
  });

  it(':/id/view (POST) - should track a product view', async () => {
    const response = await request(app.getHttpServer())
      .post('/listing')
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        title: 'E2E Test E-book',
        description: 'Created during E2E testing',
        price: 14.99,
        fileUrl: 'https://example.com/test-file.pdf',
        categories: [{ name: 'Testing' }]
      });

    return request(app.getHttpServer())
      .post(`/listing/${response.body.id}/view`)
      .set('Cookie', [`jwt=${authToken}`])
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('productId', response.body.id);
      });
  });

  it('viewed (GET) - should return viewed products', async () => {
    const response = await request(app.getHttpServer())
      .post('/listing')
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        title: 'E2E Test E-book',
        description: 'Created during E2E testing',
        price: 14.99,
        fileUrl: 'https://example.com/test-file.pdf',
        categories: [{ name: 'Testing' }]
      });

    await request(app.getHttpServer())
      .post(`/listing/${response.body.id}/view`)
      .set('Cookie', [`jwt=${authToken}`])
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('productId', response.body.id);
      });

    return request(app.getHttpServer())
      .get('/listing/viewed')
      .set('Cookie', [`jwt=${authToken}`])
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
