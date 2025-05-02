import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(8).toString('hex');
  const hash = await scrypt(password, salt, 32) as Buffer;
  return salt + '.' + hash.toString('hex');
}

export async function createUserAndLogin(app, prisma: PrismaService) {
  const plainPassword = 'password123';
  const hashedPassword = await hashPassword(plainPassword);
  
  const user = await prisma.user.create({
    data: {
      email: 'e2e-test-acc1@example.com',
      password: hashedPassword,
      name: 'E2E Test User',
      surname: 'E2E Test Surname',
      stripeStatus: 'verified'
    }
  });
  
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: 'e2e-test-acc@example.com',
      password: plainPassword
    });
  
  let token;
  if (loginResponse.headers['set-cookie']) {
    const cookies = loginResponse.headers['set-cookie'];

    for (const cookie of cookies) {
      if (cookie.startsWith('jwt=')) {
        token = cookie.split(';')[0].split('=')[1];
        break;
      }
    }
  }
  
  if (!token) {
    console.log('Could not extract token from cookies, creating a test token');
    const jwtService = new JwtService({ 
      secret: process.env.JWT_SECRET || 'supersecretkey123'
    });
    
    token = jwtService.sign({
      userId: user.id,
      username: user.email
    });
  }
  
  return { user, token };
}