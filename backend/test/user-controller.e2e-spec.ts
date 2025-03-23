import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import * as cookieParser from 'cookie-parser';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
  
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
  
      app = moduleFixture.createNestApplication();
      app.use(cookieParser());
      app.useGlobalPipes(new ValidationPipe());
      await app.init();
  
      prismaService = app.get<PrismaService>(PrismaService);
    });
  
    beforeEach(async () => {
      await cleanupTestData();
    });
  
    afterAll(async () => {
      await cleanupTestData();
      await app.close();
    });
  
    async function cleanupTestData() {
      try {
        await prismaService.viewedListing.deleteMany({
          where: { user: { email: { contains: 'test' } } }
        });
        
        await prismaService.favourite.deleteMany({
          where: { user: { email: { contains: 'test' } } }
        });
        
        await prismaService.review.deleteMany({
          where: { buyer: { email: { contains: 'test' } } }
        });
        
        await prismaService.order.deleteMany({
          where: { buyer: { email: { contains: 'test' } } }
        });
        
        await prismaService.product.deleteMany({
          where: { seller: { email: { contains: 'test' } } }
        });
        
        await prismaService.user.deleteMany({
          where: { email: { contains: 'test' } }
        });
      } catch (error) {
        console.error('Error cleaning up test data:', error);
      }
    }
  
    describe('/user/:email (GET)', () => {
      it('should return a user when found by email', async () => {
        const testUser = await prismaService.user.create({
          data: {
            name: 'Test User',
            email: 'test-e2e@example.com',
            password: 'password-hash',
          },
        });
  
        return request(app.getHttpServer())
          .get(`/user/${testUser.email}`)
          .expect(200)
          .expect((response) => {
            expect(response.body).toBeDefined();
            expect(response.body.email).toBe(testUser.email);
            expect(response.body.name).toBe(testUser.name);
          });
      });
  
      it('should return 404 when user is not found', async () => {
        return request(app.getHttpServer())
          .get('/user/nonexistent@example.com')
          .expect(404)
      });
  
      it('should handle special characters in email parameter', async () => {
        const encodedEmail = encodeURIComponent('test+special@example.com');
        
        const testUser = await prismaService.user.create({
          data: {
            name: 'Special Email User',
            email: 'test+special@example.com',
            password: 'password-hash',
          },
        });
  
        return request(app.getHttpServer())
          .get(`/user/${encodedEmail}`)
          .expect(200)
          .expect((response) => {
            expect(response.body).toBeDefined();
            expect(response.body.email).toBe('test+special@example.com');
          });
      });
    });
  });