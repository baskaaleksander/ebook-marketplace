import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  
  const mockUserService = {
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
  };
  
  const mockJwtService = {
    sign: jest.fn(),
  };
  
  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    
    // Reset all mocks between tests
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return a token', async () => {
      // Setup
      const createUserDto = { 
        email: 'test@example.com', 
        password: 'password123', 
        name: 'Test User'
      };
      
      const newUser = { 
        id: '1', 
        email: 'test@example.com', 
        name: 'Test User',
        password: 'salt.hash' 
      };
      
      mockUserService.findUserByEmail.mockResolvedValue(null); // No existing user
      mockUserService.createUser.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      
      // Execute
      const result = await authService.register(createUserDto);
      
      // Verify
      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(mockUserService.createUser).toHaveBeenCalled();
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { username: newUser.email, userId: newUser.id },
        { secret: expect.any(String) }
      );
      expect(result).toEqual({ access_token: 'mock-jwt-token' });
    });

    it('should throw an exception if user already exists', async () => {
      // Setup
      const createUserDto = { 
        email: 'existing@example.com', 
        password: 'password123', 
        name: 'Existing User'
      };
      
      mockUserService.findUserByEmail.mockResolvedValue({ 
        id: '1', 
        email: 'existing@example.com' 
      });
      
      // Execute & Verify
      await expect(authService.register(createUserDto))
        .rejects
        .toThrow(UnauthorizedException);
      
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('validateCredentials', () => {
    it('should validate credentials and return a token', async () => {
      // Generate a real password hash for testing
      const salt = randomBytes(8).toString('hex');
      const hash = await scrypt('password123', salt, 32) as Buffer;
      const hashedPassword = salt + '.' + hash.toString('hex');
      
      // Setup
      const credentials = { 
        email: 'test@example.com', 
        password: 'password123'
      };
      
      const existingUser = { 
        id: '1', 
        email: 'test@example.com', 
        password: hashedPassword 
      };
      
      mockUserService.findUserByEmail.mockResolvedValue(existingUser);
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      
      // Execute
      const result = await authService.validateCredentials(credentials);
      
      // Verify
      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(credentials.email);
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { username: existingUser.email, userId: existingUser.id },
        { secret: expect.any(String) }
      );
      expect(result).toEqual({ access_token: 'mock-jwt-token' });
    });

    it('should throw exception if user does not exist', async () => {
      // Setup
      const credentials = { 
        email: 'nonexistent@example.com', 
        password: 'password123'
      };
      
      mockUserService.findUserByEmail.mockResolvedValue(null);
      
      // Execute & Verify
      await expect(authService.validateCredentials(credentials))
        .rejects
        .toThrow(NotFoundException);
      
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw exception if password is invalid', async () => {
      // Generate a real password hash for testing
      const salt = randomBytes(8).toString('hex');
      const hash = await scrypt('correct-password', salt, 32) as Buffer;
      const hashedPassword = salt + '.' + hash.toString('hex');
      
      // Setup
      const credentials = { 
        email: 'test@example.com', 
        password: 'wrong-password'
      };
      
      const existingUser = { 
        id: '1', 
        email: 'test@example.com', 
        password: hashedPassword 
      };
      
      mockUserService.findUserByEmail.mockResolvedValue(existingUser);
      
      // Execute & Verify
      await expect(authService.validateCredentials(credentials))
        .rejects
        .toThrow(UnauthorizedException);
      
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should generate and return a JWT token', async () => {
      // Setup
      const loginDto = { 
        username: 'test@example.com', 
        userId: '1'
      };
      
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
      
      // Execute
      const result = await authService.login(loginDto);
      
      // Verify
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { username: loginDto.username, userId: loginDto.userId },
        { secret: expect.any(String) }
      );
      expect(result).toEqual({ access_token: 'mock-jwt-token' });
    });
  });
});