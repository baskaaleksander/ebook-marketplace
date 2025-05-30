import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { setupTestDatabase, cleanupTestDatabase } from './test-setup';

describe('AuthController (e2e)', () => {
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
  });

  beforeEach(async () => {
    await cleanupTestDatabase(prismaService);
    prismaService = await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase(prismaService);
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user and return a success message with JWT cookie', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test-register@example.com',
          password: 'password123',
          name: 'Test User',
          surname: 'Test Surname',
        })
        .expect(201)
        .expect((response) => {
          expect(response.body).toEqual({ message: 'User created successfully' });
          expect(response.headers['set-cookie']).toBeDefined();
          expect(response.headers['set-cookie'][0]).toContain('jwt=');   
        });

      const user = await prismaService.user.findUnique({
        where: { email: 'test-register@example.com' }
      });

      if(!user) {
        throw new Error('User not found');
      }
      
      expect(user).toBeDefined();
      expect(user.name).toBe('Test User'); 
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test-invalid@example.com',
        })
        .expect(400)
        .expect(response => {
          expect(response.body.message).toStrictEqual(["password must be a string", "name must be a string", "surname must be a string"]);
        });
    });

    it('should return 401 if user already exists', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test-duplicate@example.com',
          password: 'password123',
          name: 'Test User',
          surname: 'Test Surname',
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test-duplicate@example.com',
          password: 'password123',
          name: 'Test User',
          surname: 'Test Surname',
        })
        .expect(401)
        .expect(response => {
          expect(response.body.message).toContain('User already exists');
        });
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login a user and return a JWT cookie', async () => {
      const register = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test-login@example.com',
          password: 'password123',
          name: 'Test Login User',
          surname: 'Test Login Surname',
        });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test-login@example.com',
          password: 'password123',
        })
        .expect(201)
        .expect(response => {
          expect(response.headers['set-cookie']).toBeDefined();
          expect(response.headers['set-cookie'][0]).toContain('jwt=');
          
          const cookieString = response.headers['set-cookie'][0];
          const jwtMatch = cookieString.match(/jwt=([^;]+)/);
          expect(jwtMatch).toBeTruthy();
        });
    });

    it('should return 404 if user does not exist', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(404)
        .expect(response => {
          expect(response.body.message).toContain('User not found');
        });
    });

    it('should return 401 if password is incorrect', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test-wrong-password@example.com',
          password: 'password123',
          name: 'Test Wrong Password User',
          surname: 'Test Wrong Password Surname',
        });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test-wrong-password@example.com',
          password: 'wrong-password',
        })
        .expect(401)
        .expect(response => {
          expect(response.body.message).toContain('Invalid credentials');
        });
    });
  });
});
