import { Test, TestingModule } from '@nestjs/testing';
import { FavouritesService } from './favourites.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('FavouritesService', () => {
  let service: FavouritesService;
  let prismaService: PrismaService;

  const mockFavorite = {
    id: 'fav1',
    userId: 'user1',
    productId: 'product1',
    createdAt: new Date()
  };

  const mockPrismaService = {
    favourite: {
      findMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavouritesService,
        { provide: PrismaService, useValue: mockPrismaService }
      ],
    }).compile();

    service = module.get<FavouritesService>(FavouritesService);
    prismaService = module.get<PrismaService>(PrismaService);
    
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFavorites', () => {
    it('should return user favorites', async () => {
      mockPrismaService.favourite.findMany.mockResolvedValue([mockFavorite]);

      const result = await service.getFavorites('user1');

      expect(mockPrismaService.favourite.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' }
      });
      expect(result).toEqual([mockFavorite]);
    });
  });

  describe('addFavorite', () => {
    it('should add a listing to favorites', async () => {
      mockPrismaService.favourite.create.mockResolvedValue(mockFavorite);

      const result = await service.addFavorite('user1', 'product1');

      expect(mockPrismaService.favourite.create).toHaveBeenCalledWith({
        data: {
          productId: 'product1',
          userId: 'user1'
        }
      });
      expect(result).toEqual(mockFavorite);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite when it exists', async () => {
      mockPrismaService.favourite.findFirst.mockResolvedValue(mockFavorite);
      mockPrismaService.favourite.delete.mockResolvedValue(mockFavorite);

      await service.removeFavorite('user1', 'product1');

      expect(mockPrismaService.favourite.findFirst).toHaveBeenCalledWith({
        where: {
          userId: 'user1',
          productId: 'product1'
        }
      });
      expect(mockPrismaService.favourite.delete).toHaveBeenCalledWith({
        where: { id: 'fav1' }
      });
    });

    it('should throw NotFoundException when favorite does not exist', async () => {
      mockPrismaService.favourite.findFirst.mockResolvedValue(null);

      await expect(service.removeFavorite('user1', 'nonexistent'))
        .rejects.toThrow(NotFoundException);
    });
  });
});