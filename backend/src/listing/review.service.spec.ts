import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ReviewOrderDto } from './dtos/review-order.dto';

describe('ReviewService', () => {
  let service: ReviewService;
  let prismaService: PrismaService;

  // Mock data
  const mockReview = {
    id: 'review1',
    rating: 5,
    comment: 'Great book!',
    buyerId: 'user1',
    productId: 'product1',
    createdAt: new Date()
  };

  const mockProduct = {
    id: 'product1',
    title: 'Test Book',
    reviews: [mockReview]
  };

  const mockUser = {
    id: 'user1',
    orders: [
      { id: 'order1', productId: 'product1' }
    ]
  };

  // Mock PrismaService
  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
    },
    review: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    order: {
      findFirst: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: PrismaService, useValue: mockPrismaService }
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    prismaService = module.get<PrismaService>(PrismaService);
    
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getReviews', () => {
    it('should return reviews for a product', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      // Act
      const result = await service.getReviews('product1');

      // Assert
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product1' },
        include: { reviews: true }
      });
      expect(result).toEqual([mockReview]);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getReviews('nonexistent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('createReview', () => {
    it('should create a review for a purchased product', async () => {
      // Arrange
      const reviewDto: ReviewOrderDto = {
        rating: 5,
        comment: 'Excellent read!'
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.order.findFirst.mockResolvedValue({ id: 'order1' });
      mockPrismaService.review.create.mockResolvedValue({
        ...mockReview,
        comment: reviewDto.comment
      });

      // Act
      await service.createReview('product1', 'user1', reviewDto);

      // Assert
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' },
        include: { orders: true }
      });
      expect(mockPrismaService.review.create).toHaveBeenCalledWith({
        data: {
          buyerId: 'user1',
          productId: 'product1',
          rating: 5,
          comment: 'Excellent read!'
        }
      });
    });

    it('should throw NotFoundException when user has not purchased the product', async () => {
      // Arrange
      const reviewDto: ReviewOrderDto = {
        rating: 5,
        comment: 'Great book!'
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.order.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createReview('product2', 'user1', reviewDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  // Add more tests for other methods...
});