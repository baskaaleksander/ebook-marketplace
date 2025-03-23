import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import Stripe from 'stripe';

jest.mock('stripe');

describe('StripeService', () => {
  let service: StripeService;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
    }).compile();

    service = module.get<StripeService>(StripeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});