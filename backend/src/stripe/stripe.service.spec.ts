import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import Stripe from 'stripe';

jest.mock('stripe');

describe('StripeService', () => {
  let service: StripeService;
  let prismaService: PrismaService;
  let configService: ConfigService;
  let stripeMock: {
    accounts: {
      create: jest.Mock;
      retrieve: jest.Mock;
      del: jest.Mock;
    };
    accountLinks: {
      create: jest.Mock;
    };
    balance: {
      retrieve: jest.Mock;
    };
    payouts: {
      create: jest.Mock;
      retrieve: jest.Mock;
      cancel: jest.Mock;
    };
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'STRIPE_SECRET_KEY') return 'test_key';
      if (key === 'FRONTEND_URL') return 'http://localhost:3000';
      return null;
    }),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payout: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    stripeMock = {
      accounts: {
        create: jest.fn(),
        retrieve: jest.fn(),
        del: jest.fn(),
      },
      accountLinks: {
        create: jest.fn(),
      },
      balance: {
        retrieve: jest.fn(),
      },
      payouts: {
        create: jest.fn(),
        retrieve: jest.fn(),
        cancel: jest.fn(),
      },
    };

    (Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => stripeMock as any);    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('connectAccount', () => {
    it('should connect a user to a Stripe account', async () => {
      const userId = 'user123';
      const accountId = 'acct_123';
      const accountLinkUrl = 'https://connect.stripe.com/setup/123';
      
      // Mock implementation
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, stripeAccount: null });
      mockPrismaService.user.update.mockResolvedValue({ id: userId, stripeAccount: accountId });
      stripeMock.accounts.create.mockResolvedValue({ id: accountId } as Stripe.Account);
      stripeMock.accountLinks.create.mockResolvedValue({ url: accountLinkUrl } as Stripe.AccountLink);
      
      const result = await service.connectAccount(userId);
      
      expect(stripeMock.accounts.create).toHaveBeenCalledWith({
        type: 'express',
        country: 'PL',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { stripeAccount: accountId }
      });
      expect(stripeMock.accountLinks.create).toHaveBeenCalledWith({
        account: accountId,
        refresh_url: 'http://localhost:3000/reauth',
        return_url: 'http://localhost:3000/return',
        type: 'account_onboarding',
      });
      expect(result).toEqual({ url: accountLinkUrl });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      stripeMock.accounts.create.mockResolvedValue({ id: 'acct_123' } as Stripe.Account);
      
      await expect(service.connectAccount('nonexistent_user')).rejects.toThrow(Error);
      expect(stripeMock.accounts.create).toHaveBeenCalled();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user already has Stripe account', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'user123', stripeAccount: 'existing_acct' });
      stripeMock.accounts.create.mockResolvedValue({ id: 'acct_123' } as Stripe.Account);
      
      await expect(service.connectAccount('user123')).rejects.toThrow(Error);
      expect(stripeMock.accounts.create).toHaveBeenCalled();
      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('disconnectAccount', () => {
    it('should disconnect a user from Stripe account', async () => {
      const userId = 'user123';
      const accountId = 'acct_123';
      
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, stripeAccount: accountId });
      mockPrismaService.user.update.mockResolvedValue({ id: userId, stripeAccount: null });
      stripeMock.accounts.del.mockResolvedValue({ id: accountId, deleted: true } as Stripe.DeletedAccount);
      
      const result = await service.disconnectAccount(userId);
      
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { stripeAccount: null, stripeStatus: 'unverified' }
      });
      expect(stripeMock.accounts.del).toHaveBeenCalledWith(accountId);
      expect(result).toBe('Account disconnected');
    });

    it('should throw NotFoundException if user not found or not connected', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      
      await expect(service.disconnectAccount('nonexistent_user')).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
      expect(stripeMock.accounts.del).not.toHaveBeenCalled();
    });
  });

  describe('createPayout', () => {
    it('should create a payout successfully', async () => {
      const userId = 'user123';
      const accountId = 'acct_123';
      const payoutId = 'po_123';
      const amount = 1000;
      
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, stripeAccount: accountId });
      stripeMock.accounts.retrieve.mockResolvedValue({ id: accountId } as Stripe.Account);
      stripeMock.balance.retrieve.mockResolvedValue({ 
        available: [{ amount: 2000, currency: 'pln' }]
      } as Stripe.Balance);
      stripeMock.payouts.create.mockResolvedValue({ id: payoutId } as Stripe.Payout);
      mockPrismaService.payout.create.mockResolvedValue({ id: 'db_payout_id', amount, userId, stripePayoutId: payoutId });
      
      const result = await service.createPayout(amount, userId);
      
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(stripeMock.accounts.retrieve).toHaveBeenCalledWith(accountId);
      expect(stripeMock.balance.retrieve).toHaveBeenCalledWith({ stripeAccount: accountId });
      expect(stripeMock.payouts.create).toHaveBeenCalledWith(
        {
          amount,
          currency: 'pln',
          metadata: { 'userId': userId }
        },
        {
          stripeAccount: accountId
        }
      );
      expect(mockPrismaService.payout.create).toHaveBeenCalledWith({
        data: {
          amount,
          userId,
          stripePayoutId: payoutId
        }
      });
      expect(result).toEqual({ message: 'Payout created', payout: { id: payoutId } });
    });

    it('should throw NotFoundException if user not found or not connected', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      
      await expect(service.createPayout(1000, 'nonexistent_user')).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
      expect(stripeMock.accounts.retrieve).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if insufficient funds', async () => {
      const userId = 'user123';
      const accountId = 'acct_123';
      const amount = 2000;
      
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, stripeAccount: accountId });
      stripeMock.accounts.retrieve.mockResolvedValue({ id: accountId } as Stripe.Account);
      stripeMock.balance.retrieve.mockResolvedValue({ 
        available: [{ amount: 1000, currency: 'pln' }]
      } as Stripe.Balance);
      
      await expect(service.createPayout(amount, userId)).rejects.toThrow(Error);
      expect(stripeMock.payouts.create).not.toHaveBeenCalled();
      expect(mockPrismaService.payout.create).not.toHaveBeenCalled();
    });
  });

  describe('getPayout', () => {
    it('should return payout details for authorized user', async () => {
      const payoutId = 'payout123';
      const userId = 'user123';
      const payoutData = { id: payoutId, amount: 1000, userId, stripePayoutId: 'po_123' };
      
      mockPrismaService.payout.findUnique.mockResolvedValue(payoutData);
      
      const result = await service.getPayout(payoutId, userId);
      
      expect(mockPrismaService.payout.findUnique).toHaveBeenCalledWith({ where: { id: payoutId } });
      expect(result).toEqual(payoutData);
    });

    it('should throw NotFoundException if payout not found', async () => {
      mockPrismaService.payout.findUnique.mockResolvedValue(null);
      
      await expect(service.getPayout('nonexistent_payout', 'user123')).rejects.toThrow(Error);
    });

    it('should throw UnauthorizedException if user not authorized', async () => {
      const payoutData = { id: 'payout123', amount: 1000, userId: 'other_user', stripePayoutId: 'po_123' };
      mockPrismaService.payout.findUnique.mockResolvedValue(payoutData);
      
      await expect(service.getPayout('payout123', 'user123')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('cancelPayout', () => {
    it('should cancel a pending payout successfully', async () => {
      const payoutId = 'po_123';
      const userId = 'user123';
      
      stripeMock.payouts.retrieve.mockResolvedValue({ 
        id: payoutId, 
        status: 'pending', 
        metadata: { userId }
      } as unknown as Stripe.Payout);
      
      stripeMock.payouts.cancel.mockResolvedValue({} as Stripe.Payout);
      
      await service.cancelPayout(payoutId, userId);
      
      expect(stripeMock.payouts.retrieve).toHaveBeenCalledWith(payoutId);
      expect(stripeMock.payouts.cancel).toHaveBeenCalledWith(payoutId);
    });

    it('should throw NotFoundException if payout not found', async () => {
      stripeMock.payouts.retrieve.mockResolvedValue(null as unknown as Stripe.Payout);
      
      await expect(service.cancelPayout('nonexistent_payout', 'user123')).rejects.toThrow(Error);
      expect(stripeMock.payouts.cancel).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException (error) if user not authorized', async () => {
      stripeMock.payouts.retrieve.mockResolvedValue({ 
        id: 'po_123', 
        status: 'pending', 
        metadata: { userId: 'other_user' }
      } as unknown as Stripe.Payout);
      
      await expect(service.cancelPayout('po_123', 'user123')).rejects.toThrow(Error);
      expect(stripeMock.payouts.cancel).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException (error) if payout not pending', async () => {
      stripeMock.payouts.retrieve.mockResolvedValue({ 
        id: 'po_123', 
        status: 'paid', 
        metadata: { userId: 'user123' }
      } as unknown as Stripe.Payout);
      
      await expect(service.cancelPayout('po_123', 'user123')).rejects.toThrow(Error);
      expect(stripeMock.payouts.cancel).not.toHaveBeenCalled();
    });
  });

  describe('checkAccountStatus', () => {
    it('should return account status', async () => {
      const accountId = 'acct_123';
      const accountData = { id: accountId, charges_enabled: true } as Stripe.Account;
      
      stripeMock.accounts.retrieve.mockResolvedValue(accountData);
      
      const result = await service.checkAccountStatus(accountId);
      
      expect(stripeMock.accounts.retrieve).toHaveBeenCalledWith(accountId);
      expect(result).toEqual(accountData);
    });
  });

  describe('getCurrentBalance', () => {
    it('should return current balance for user', async () => {
      const userId = 'user123';
      const accountId = 'acct_123';
      const balanceData = { available: [{ amount: 1000, currency: 'pln' }] } as Stripe.Balance;
      
      mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, stripeAccount: accountId });
      stripeMock.balance.retrieve.mockResolvedValue(balanceData);
      
      const result = await service.getCurrentBalance(userId);
      
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(stripeMock.balance.retrieve).toHaveBeenCalledWith({ stripeAccount: accountId });
      expect(result).toEqual(balanceData);
    });

    it('should throw NotFoundException if user not found or not connected', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      
      await expect(service.getCurrentBalance('nonexistent_user')).rejects.toThrow(NotFoundException);
      expect(stripeMock.balance.retrieve).not.toHaveBeenCalled();
    });
  });
});