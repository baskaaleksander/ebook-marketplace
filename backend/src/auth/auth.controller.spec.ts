import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { UserCredentialsDto } from './dtos/user-credentials.dto';
import { Response } from 'express';


describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    validateCredentials: jest.fn(),
  };

  const mockResponse = () => {
    const res = {} as Response;
    res.cookie = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and set JWT cookie', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        surname: 'User',
      };
      
      const mockToken = { access_token: 'mock-jwt-token' };
      mockAuthService.register.mockResolvedValue(mockToken);
      
      const res = mockResponse();
      
      await controller.register(createUserDto, res);
      
      expect(authService.register).toHaveBeenCalledWith(createUserDto);
      expect(res.cookie).toHaveBeenCalledWith('jwt', 'mock-jwt-token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
      });
      expect(res.send).toHaveBeenCalledWith({ message: 'User created successfully' });
    });

    it('should propagate errors from auth service during registration', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
        surname: 'User',
      };
      
      const error = new Error('Email already exists');
      mockAuthService.register.mockRejectedValue(error);
      
      const res = mockResponse();
      
      await expect(controller.register(createUserDto, res)).rejects.toThrow(error);
      
      expect(authService.register).toHaveBeenCalledWith(createUserDto);
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login a user and set JWT cookie', async () => {
      const userCredentials: UserCredentialsDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      
      const mockToken = { access_token: 'mock-jwt-token' };
      mockAuthService.validateCredentials.mockResolvedValue(mockToken);
      
      const res = mockResponse();
      
      await controller.login(userCredentials, res);
      
      expect(authService.validateCredentials).toHaveBeenCalledWith(userCredentials);
      expect(res.cookie).toHaveBeenCalledWith('jwt', 'mock-jwt-token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000,
      });
    });

    it('should propagate errors from auth service during login', async () => {
      const userCredentials: UserCredentialsDto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };
      
      const error = new Error('Invalid credentials');
      mockAuthService.validateCredentials.mockRejectedValue(error);
      
      const res = mockResponse();
      
      await expect(controller.login(userCredentials, res)).rejects.toThrow(error);
      
      expect(authService.validateCredentials).toHaveBeenCalledWith(userCredentials);
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });
});