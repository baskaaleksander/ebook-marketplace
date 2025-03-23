import { Test, TestingModule } from '@nestjs/testing';
import { ViewedListingsService } from './viewedListing.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ViewedListingsService', () => {
  let service: ViewedListingsService;
  let prismaService: PrismaService;

  const mockViewedListing = {
    id: 'view1',
    userId: 'user1',
    productId: 'product1',
    viewedAt: new Date(),
    product: {
      id: 'product1',
      title: 'Test Product'
    }
  };

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
    },
    viewedListing: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewedListingsService,
        { provide: PrismaService, useValue: mockPrismaService }
      ],
    }).compile();

    service = module.get<ViewedListingsService>(ViewedListingsService);
    prismaService = module.get<PrismaService>(PrismaService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('trackListingView', () => {
    it('should track a product view when product exists', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue({
        id: 'product1',
        title: 'Test Product'
      });
      
      mockPrismaService.viewedListing.upsert.mockResolvedValue(mockViewedListing);

      await service.trackListingView('user1', 'product1');

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product1' }
      });

      expect(mockPrismaService.viewedListing.upsert).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId: 'user1',
            productId: 'product1'
          }
        },
        update: {
          viewedAt: expect.any(Date)
        },
        create: {
          userId: 'user1',
          productId: 'product1',
        }
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      
      // Expect the method to throw NotFoundException
      await expect(service.trackListingView('user1', 'nonexistent'))
        .rejects.toThrow(NotFoundException);
      
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent' }
      });
      
      expect(mockPrismaService.viewedListing.upsert).not.toHaveBeenCalled();
    });
  });

  describe('getViewedProducts', () => {
    it('should return recently viewed products', async () => {
      mockPrismaService.viewedListing.findMany.mockResolvedValue([mockViewedListing]);

      const result = await service.getViewedProducts('user1');

      expect(mockPrismaService.viewedListing.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { viewedAt: 'desc' },
        take: 10,
        include: { product: true }
      });
      expect(result).toEqual([mockViewedListing]);
    });
  });

  describe('clearViewedProducts', () => {
    it('should clear old viewed products', async () => {
      mockPrismaService.viewedListing.deleteMany.mockResolvedValue({ count: 5 });

      const result = await service.clearViewedProducts();

      expect(mockPrismaService.viewedListing.deleteMany).toHaveBeenCalledWith({
        where: {
          viewedAt: {
            lt: expect.any(Date)
          }
        }
      });
      expect(result).toBe(5);
    });
  });
});