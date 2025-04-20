import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserResponseDto } from './dtos/user-response.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    // Static path endpoints first
    @ApiOperation({ summary: 'Get average ratings for a user' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'Average ratings retrieved successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @Get('avgratings/:id')
    reviewAvgRatings(@Param('id') id: string) {
        return this.userService.reviewAvgRatings(id);
    }

    // Basic user CRUD operations
    @ApiOperation({ summary: 'Find user by ID' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User retrieved successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @Get(':id')
    @Serialize(UserResponseDto)
    findUserById(@Param('id') id: string) {
        return this.userService.findUserById(id);
    }
    
    @ApiOperation({ summary: 'Update user information' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiBearerAuth()
    @Put(':id')
    @Serialize(UserResponseDto)
    @UseGuards(AuthGuard('jwt'))
    updateUser(@Param('id') id: string, @Body() body: Partial<CreateUserDto>) {
        return this.userService.updateUser(id, body);
    }

    // User related resources
    @ApiOperation({ summary: 'Get reviews for a user' })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({ status: 200, description: 'User reviews retrieved successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @Get(':id/reviews')
    getUserReviews(@Param('id') id: string) {
        return this.userService.getUserReviews(id);
    }

}
