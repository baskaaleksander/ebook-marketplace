import { Test, TestingModule } from '@nestjs/testing';
import { ListingService } from './listing.service';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateListingDto } from './dtos/create-listing.dto';

describe('ListingService', () => {
  let service: ListingService;
  let prismaService: PrismaService;

  // Mock data
  const mockUser = {
    id: 'user1',
    email: 'test@example.com',
    password: 'hashed-password',
    name: 'Test User',
    stripeStatus: 'verified',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockProduct = {
    id: 'product1',
    title: 'Test Product',
    description: 'Test Description',
    price: 9.99,
    fileUrl: 'https://example.com/file.pdf',
    sellerId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockCategory = {
    id: 'category1',
    name: 'Test Category'
  };

  // Mock PrismaService
  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
    category: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    }
  };

  // Mock UserService
  const mockUserService = {
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: UserService, useValue: mockUserService }
      ],
    }).compile();

    service = module.get<ListingService>(ListingService);
    prismaService = module.get<PrismaService>(PrismaService);
    
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createListing', () => {
    it('should create a listing with valid data and verified seller', async () => {
      // Arrange
      const createListingDto: CreateListingDto = {
        title: 'New E-book',
        description: 'Great content',
        price: 19.99,
        fileUrl: 'https://example.com/ebook.pdf',
        categories: [{ name: 'Fiction' }]
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        stripeStatus: 'verified'
      });
      
      mockPrismaService.category.findFirst.mockResolvedValue(mockCategory);
      
      mockPrismaService.product.create.mockResolvedValue({
        ...mockProduct,
        title: createListingDto.title,
        description: createListingDto.description,
        price: createListingDto.price,
        fileUrl: createListingDto.fileUrl,
        categories: [mockCategory]
      });

      // Act
      const result = await service.createListing(createListingDto, 'user1');

      // Assert
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' }
      });
      
      expect(mockPrismaService.product.create).toHaveBeenCalled();
      expect(result).toHaveProperty('title', createListingDto.title);
      expect(result).toHaveProperty('price', createListingDto.price);
    });

    it('should throw UnauthorizedException if seller is not verified', async () => {
      // Arrange
      const createListingDto: CreateListingDto = {
        title: 'New E-book',
        description: 'Great content',
        price: 19.99,
        fileUrl: 'https://example.com/ebook.pdf',
        categories: [{ name: 'Fiction' }]
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        stripeStatus: 'unverified'
      });

      // Act & Assert
      await expect(service.createListing(createListingDto, 'user1'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findListingById', () => {
    it('should return a listing when it exists', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue({
        ...mockProduct,
        categories: [mockCategory]
      });

      // Act
      const result = await service.findListingById('product1');

      // Assert
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product1' },
        include: { categories: true }
      });
      expect(result).toEqual({
        ...mockProduct,
        categories: [mockCategory]
      });
    });

    it('should throw NotFoundException when listing does not exist', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findListingById('nonexistent'))
        .rejects.toThrow(NotFoundException);
    });
  });

  // Add more tests for other methods...
});