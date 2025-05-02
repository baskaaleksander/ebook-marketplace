import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    findUserById: jest.fn(),
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

  describe('findUserById', () => {
    it('should return a user when a valid email is provided', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test User' };
      mockUserService.findUserById.mockResolvedValue(mockUser);

      const result = await controller.findUserById('user-1');
      
      expect(result).toEqual(mockUser);
      expect(userService.findUserById).toHaveBeenCalledWith('user-1');
      expect(userService.findUserById).toHaveBeenCalledTimes(1);
    });

    it('should propagate NotFoundException if user is not found', async () => {
      mockUserService.findUserById.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.findUserById('not-existing-id'))
        .rejects
        .toThrow(NotFoundException);
        
      expect(userService.findUserById).toHaveBeenCalledWith('not-existing-id');
    });
  });
});
