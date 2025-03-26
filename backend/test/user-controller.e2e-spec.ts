import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import * as cookieParser from 'cookie-parser';
import { setupTestDatabase, cleanupTestDatabase } from './test-setup';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  
  beforeAll(async () => {

    prismaService = await setupTestDatabase();
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(PrismaService)
    .useValue(prismaService)
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await cleanupTestDatabase(prismaService);
    await app.close();
  });

  
  
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