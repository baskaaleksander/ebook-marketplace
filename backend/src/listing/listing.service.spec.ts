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
    categoryOnProduct: {
      findFirst: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    favourite: {
      findFirst: jest.fn(),
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
        imageUrl: 'https://example.com/image.jpg',
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
        imageUrl: createListingDto.imageUrl,
        price: createListingDto.price,
        fileUrl: createListingDto.fileUrl,
        categories: [mockCategory]
      });

      const result = await service.createListing(createListingDto, 'user1');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' }
      });
      
      expect(mockPrismaService.product.create).toHaveBeenCalled();
      expect(result.data).toHaveProperty('title', createListingDto.title);
      expect(result.data).toHaveProperty('price', createListingDto.price);
    });

    it('should throw UnauthorizedException if seller is not verified', async () => {
      // Arrange
      const createListingDto: CreateListingDto = {
        title: 'New E-book',
        description: 'Great content',
        price: 19.99,
        imageUrl: 'https://example.com/image.jpg',
        fileUrl: 'https://example.com/ebook.pdf',
        categories: [{ name: 'Fiction' }]
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        stripeStatus: 'unverified'
      });

      await expect(service.createListing(createListingDto, 'user1'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findListingById', () => {
    it('should return a listing when it exists', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue({
        ...mockProduct,
        imageUrl: 'https://example.com/image.jpg',
        isFeatured: false,
        featuredForTime: null,
        categories: [mockCategory],
        seller: {
          id: 'user1',
          name: 'Test User',
          surname: 'Smith',
          email: 'test@example.com',
          avatarUrl: 'https://example.com/avatar.jpg',
          stripeStatus: 'verified',
          createdAt: new Date()
        },
        reviews: []
      });

      const id = 'product1';

      const result = await service.findListingById(id);

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product1' },
        include: {
          categories: true,
          reviews: true,
          seller: {
            select: {
              id: true,
              name: true,
              surname: true,
              email: true,
              avatarUrl: true,
              stripeStatus: true,
              createdAt: true,
            }
          }
        }
      });
      
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('id', 'product1');
      expect(result.data).toHaveProperty('title', 'Test Product');
      expect(result.data).toHaveProperty('seller');
      expect(result.data.seller).toHaveProperty('id', 'user1');
    });

    it('should throw NotFoundException when listing does not exist', async () => {

      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findListingById('nonexistent'))
        .rejects.toThrow(NotFoundException);
    });
  });

});