import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
        surname: 'User'
      };

      const expectedUser = {
        id: 'user-123',
        name: 'Test',
        surname: 'User',
        email: 'test@example.com',
        password: 'password123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await service.createUser(createUserDto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
      expect(result).toEqual(expectedUser);
    });

    it('should pass through any errors from the database', async () => {
      const createUserDto: CreateUserDto = {
        name: 'Test',
        surname: 'User',
        email: 'test@example.com',
        password: 'password123',
      };

      const dbError = new Error('Database error');
      mockPrismaService.user.create.mockRejectedValue(dbError);

      await expect(service.createUser(createUserDto)).rejects.toThrow(dbError);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
    });
  });

  describe('findUserById', () => {
    it('should find a user by email successfully', async () => {
      const id = 'user-123';
      const expectedUser = {
        id: 'user-123',
        name: 'Test',
        surname: 'User',
        email: 'test@example.com',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
        reviews: [],
        orders: [],
        payouts: [],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

      const result = await service.findUserById(id);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      const id = 'non-user-id';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findUserById(id)).rejects.toThrow(NotFoundException);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it('should pass through any errors from the database', async () => {
      const id = 'user-123';
      const dbError = new Error('Database error');
      mockPrismaService.user.findUnique.mockRejectedValue(dbError);

      await expect(service.findUserById(id)).rejects.toThrow(dbError);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });


  describe('Potential future methods', () => {
    
    it('should find a user by ID successfully (placeholder for future method)', async () => {
      const userId = 'user-123';
      const expectedUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

      const result = await prismaService.user.findUnique({
        where: { id: userId }
      });
      
      expect(result).toEqual(expectedUser);
    });
    
    it('should update a user successfully (placeholder for future method)', async () => {
      
      const userId = 'user-123';
      const updateData = { name: 'Updated Name' };
      const expectedUser = {
        id: userId,
        name: 'Updated Name',
        email: 'test@example.com',
        password: 'hashed-password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(expectedUser);

      const result = await prismaService.user.update({
        where: { id: userId },
        data: updateData
      });
      
      expect(result).toEqual(expectedUser);
    });
  });
});