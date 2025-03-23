import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

/**
 * Helper function to create a hashed password in the same format as your AuthService
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(8).toString('hex');
  const hash = await scrypt(password, salt, 32) as Buffer;
  return salt + '.' + hash.toString('hex');
}

/**
 * Helper function to create a test user and get authentication token
 */
export async function createUserAndLogin(app, prisma: PrismaService) {
  // Create a test user with properly hashed password
  const plainPassword = 'password123';
  const hashedPassword = await hashPassword(plainPassword);
  
  const user = await prisma.user.create({
    data: {
      email: 'e2e-test@example.com',
      password: hashedPassword,
      name: 'E2E Test User',
      stripeStatus: 'verified'
    }
  });
  
  // Attempt to login
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send({
      email: 'e2e-test@example.com',
      password: plainPassword
    });
  
  // Extract token from response - your AuthService sets it in cookies
  let token;
  if (loginResponse.headers['set-cookie']) {
    const cookies = loginResponse.headers['set-cookie'];
    // Parse the JWT from cookie
    for (const cookie of cookies) {
      if (cookie.startsWith('jwt=')) {
        token = cookie.split(';')[0].split('=')[1];
        break;
      }
    }
  }
  
  // If we couldn't get the token from cookies, generate a test token directly
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