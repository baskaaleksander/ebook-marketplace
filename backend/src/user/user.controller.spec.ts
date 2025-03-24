import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    findUserByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findUserByEmail', () => {
    it('should return a user when a valid email is provided', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
      mockUserService.findUserByEmail.mockResolvedValue(mockUser);

      const result = await controller.findUserByEmail({ email: 'test@example.com' });
      
      expect(result).toEqual(mockUser);
      expect(userService.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(userService.findUserByEmail).toHaveBeenCalledTimes(1);
    });

    it('should propagate NotFoundException if user is not found', async () => {
      mockUserService.findUserByEmail.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.findUserByEmail({ email: 'nonexistent@example.com' }))
        .rejects
        .toThrow(NotFoundException);
        
      expect(userService.findUserByEmail).toHaveBeenCalledWith('nonexistent@example.com');
    });
  });
});
