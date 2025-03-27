import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import { PrismaService } from '../src/prisma.service';


process.env.NODE_ENV = 'test';
dotenv.config({ path: '.env.test' });


export async function setupTestDatabase(): Promise<PrismaService> {
  try {

    const prismaService = new PrismaService();
    
    await prismaService.onModuleInit();
    
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });
    
    return prismaService;
  } catch (error) {
    console.error('Failed to setup test database', error);
    throw error;
  }
}

export async function cleanupTestDatabase(prismaService: PrismaService) {
  try {
    
    await prismaService.viewedListing.deleteMany();
    await prismaService.webhookEvent.deleteMany();
    await prismaService.review.deleteMany();
    await prismaService.favourite.deleteMany();
    
    await prismaService.refund.deleteMany();
    await prismaService.payout.deleteMany();
    await prismaService.order.deleteMany();
    
    await prismaService.product.deleteMany();
    await prismaService.category.deleteMany();
    await prismaService.user.deleteMany();
    
    await prismaService.$disconnect();
  } catch (error) {
    console.error('Failed to cleanup test database:', error);
    try {
      await prismaService.$disconnect();
    } catch (disconnectError) {
      console.error('Failed to disconnect from database after cleanup error:', disconnectError);
    }
    throw error;
  }
}