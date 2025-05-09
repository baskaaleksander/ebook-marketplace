import { Body, Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserResponseDto } from './dtos/user-response.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Users')
@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    // Static path endpoints first
    @ApiOperation({ summary: 'Get average ratings for a user' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'Average ratings retrieved successfully',
        schema: {
            example: {
                averageRating: 4.5
            }
        }
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @Get('avgratings/:id')
    reviewAvgRatings(@Param('id') id: string) {
        return this.userService.reviewAvgRatings(id);
    }

    // Basic user CRUD operations
    @ApiOperation({ summary: 'Find user by ID' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'User retrieved successfully',
        schema: {
            example: {
                id: 'user_123',
                email: 'user@example.com',
                name: 'John',
                surname: 'Doe',
                avatarUrl: 'https://example.com/avatar.jpg',
                stripeStatus: 'verified',
                createdAt: '2023-01-01T00:00:00.000Z'
            }
        }
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @Get(':id')
    @Serialize(UserResponseDto)
    findUserById(@Param('id') id: string) {
        return this.userService.findUserById(id);
    }
    
    @ApiOperation({ summary: 'Update user information' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    example: 'John',
                    description: 'User first name'
                },
                surname: {
                    type: 'string',
                    example: 'Doe',
                    description: 'User last name'
                },
                email: {
                    type: 'string',
                    example: 'john.doe@example.com',
                    description: 'User email address'
                },
                description: {
                    type: 'string',
                    example: 'I am a book enthusiast and seller',
                    description: 'User bio or description'
                },
                avatarUrl: {
                    type: 'string',
                    example: 'https://example.com/avatar.jpg',
                    description: 'URL to user avatar image'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'User updated successfully',
        schema: {
            example: {
                data: {
                    id: 'user_123',
                    email: 'user@example.com',
                    name: 'John',
                    surname: 'Doe'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiBearerAuth()
    @Patch(':id')
    @Serialize(UserResponseDto)
    @UseGuards(AuthGuard('jwt'))
    updateUser(@Param('id') id: string, @Body() body: Partial<CreateUserDto>) {
        return this.userService.updateUser(id, body);
    }

    // User related resources
    @ApiOperation({ summary: 'Get reviews for a user' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'User reviews retrieved successfully',
        schema: {
            example: [
                {
                    id: 'review_123',
                    rating: 5,
                    comment: 'Great seller!',
                    buyerId: 'user_456',
                    productId: 'product_789',
                    buyer: {
                        id: 'user_456',
                        email: 'buyer@example.com',
                        name: 'Jane',
                        surname: 'Smith',
                        avatarUrl: 'https://example.com/avatar2.jpg'
                    }
                }
            ]
        }
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    @Get(':id/reviews')
    getUserReviews(@Param('id') id: string) {
        return this.userService.getUserReviews(id);
    }

    // Delete user
    @ApiOperation({ summary: 'Delete a user' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'User deleted successfully',
        schema: {
            example: {
                message: 'User and all related data deleted successfully'
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    deleteUser(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.userService.deleteUser(id, userId);
    }
}
