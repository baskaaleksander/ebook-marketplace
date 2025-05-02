import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';
import { ReviewOrderDto } from './dtos/review-order.dto';

describe('ReviewService', () => {
  let service: ReviewService;
  let prismaService: PrismaService;

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

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
    },
    review: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    order: {
      findFirst: jest.fn(),
      update: jest.fn(),
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
    

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getReviews', () => {
    it('should return reviews for a product', async () => {

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.review.findMany.mockResolvedValue([mockReview]);

      const result = await service.getReviews('product1');

      expect(mockPrismaService.review.findMany).toHaveBeenCalledWith(
        {
          where: { productId: 'product1' },
          include: {
            buyer: {
              select: {
                avatarUrl: true,
                email: true,
                id: true,
                name: true,
                surname: true,
              }
            }
          }
        }
      );
      expect(result).toEqual([mockReview]);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      // Arrange
      mockPrismaService.review.findMany.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getReviews('nonexistent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('createReview', () => {
    it('should create a review for a purchased product', async () => {

      const reviewDto: ReviewOrderDto = {
        rating: 5,
        comment: 'Excellent read!'
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.order.findFirst.mockResolvedValue({ id: 'order1', productId: 'product1', buyerId: mockUser.id});
      mockPrismaService.review.create.mockResolvedValue({
        ...mockReview,
        comment: reviewDto.comment
      });

      await service.createReview('product1', 'user1', reviewDto);


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

      const reviewDto: ReviewOrderDto = {
        rating: 5,
        comment: 'Great book!'
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.order.findFirst.mockResolvedValue(null);

      await expect(service.createReview('product2', 'user1', reviewDto))
        .rejects.toThrow(NotFoundException);
    });
  });


});