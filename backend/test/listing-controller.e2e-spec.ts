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
  
  afterAll(async () => {

    await cleanupTestDatabase(prismaService);
    await app.close();

  });



  it('/listing (POST) - should create a new listing', () => {
    return request(app.getHttpServer())
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
        createdListingId = res.body.id;
      });
  });

  it('/listing (GET) - should return listings', () => {
    return request(app.getHttpServer())
      .get('/listing')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });


  it('/listing/:id (GET) - should return a specific listing', () => {
    return request(app.getHttpServer())
      .get(`/listing/${createdListingId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', createdListingId);
        expect(res.body).toHaveProperty('title', 'E2E Test E-book');
      });
  });


  it('/listing/:id (PUT) - should update a listing', () => {
    return request(app.getHttpServer())
      .put(`/listing/${createdListingId}`)
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        title: 'Updated E2E Test E-book',
        price: 19.99
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', createdListingId);
        expect(res.body).toHaveProperty('title', 'Updated E2E Test E-book');
        expect(res.body).toHaveProperty('price', 19.99);
      });
  });

  it('should create a test order for reviews', async () => {
    const testUser = await prismaService.user.findUnique({
      where: { email: 'e2e-test@example.com' }
    });

    if(!testUser) {
      throw new Error('Test user not found');
    }
    
    const order = await prismaService.order.create({
      data: {
        buyerId: testUser.id,
        productId: createdListingId,
        amount: 14.99,
        status: 'COMPLETED',
        checkoutSessionId: 'test-session-id'
      }
    });
    
    expect(order).toBeDefined();
  });


  it(':id/reviews (POST) - should create a review', () => {
    return request(app.getHttpServer())
      .post(`/listing/${createdListingId}/reviews`)
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
        createdReviewId = res.body.id;
      });
  });

  it(':id/reviews/ (GET) - should return reviews for a listing', () => {
    return request(app.getHttpServer())
      .get(`/listing/${createdListingId}/reviews`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
      });
  });

  it('reviews/:reviewId (GET) - should return a specific review', () => {
    return request(app.getHttpServer())
      .get(`/listing/reviews/${createdReviewId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', createdReviewId);
        expect(res.body).toHaveProperty('rating', 5);
        expect(res.body).toHaveProperty('comment', 'Great book!');
      });
    });

  it('reviews/:reviewId (PUT) - should update a review', () => {
    return request(app.getHttpServer())
      .put(`/listing/reviews/${createdReviewId}`)
      .set('Cookie', [`jwt=${authToken}`])
      .send({
        rating: 4,
        comment: 'Good book!'
      })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', createdReviewId);
        expect(res.body).toHaveProperty('rating', 4);
        expect(res.body).toHaveProperty('comment', 'Good book!');
      });
  });

  it('reviews/:reviewId (DELETE) - should delete a review', () => {
    return request(app.getHttpServer())
      .delete(`/listing/reviews/${createdReviewId}`)
      .set('Cookie', [`jwt=${authToken}`])
      .expect(200);
  });
  
  it('favourites/:id (POST) - should add a listing to favorites', () => {
    return request(app.getHttpServer())
      .post(`/listing/favourites/${createdListingId}`)
      .set('Cookie', [`jwt=${authToken}`])
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('productId', createdListingId);
      }
      );
  }
  );

  it('favourites (GET) - should return user favorites', () => {
    return request(app.getHttpServer())
      .get('/listing/favourites')
      .set('Cookie', [`jwt=${authToken}`])
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
    });

  it('favourites/:id (DELETE) - should remove a favorite', () => {
    return request(app.getHttpServer())
      .delete(`/listing/favourites/${createdListingId}`)
      .set('Cookie', [`jwt=${authToken}`])
      .expect(200);
  });

  it(':/id/view (POST) - should track a product view', () => {
    return request(app.getHttpServer())
      .post(`/listing/${createdListingId}/view`)
      .set('Cookie', [`jwt=${authToken}`])
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('productId', createdListingId);
      });
  });

  it('viewed (GET) - should return viewed products', () => {
    return request(app.getHttpServer())
      .get('/listing/viewed')
      .set('Cookie', [`jwt=${authToken}`])
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });



});