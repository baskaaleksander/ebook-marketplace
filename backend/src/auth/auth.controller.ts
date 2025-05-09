import { Body, Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { AuthService } from './auth.service';
import { UserCredentialsDto } from './dtos/user-credentials.dto';
import { Request, Response } from 'express';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiCookieAuth, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @ApiOperation({ summary: 'Change user password' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['email', 'password', 'newPassword'],
            properties: {
                email: {
                    type: 'string',
                    example: 'user@example.com',
                    description: 'User email for verification'
                },
                password: {
                    type: 'string',
                    example: 'current-password',
                    description: 'Current password for verification'
                },
                newPassword: {
                    type: 'string',
                    example: 'new-secure-password',
                    description: 'New password to set'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Password changed successfully',
        schema: {
            example: {
                access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                user: "user_123456789"
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiBearerAuth()
    @Post('/change-password')
    @UseGuards(AuthGuard('jwt'))
    async changePassword(@Body() data: ChangePasswordDto, @CurrentUser('userId') userId: string){
        return this.authService.changePassword(userId, data);
    }

    @ApiOperation({ summary: 'Get current user ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns user ID of authenticated user',
        schema: {
            example: "user_123456789"
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Get('/me')
    async me(@CurrentUser('userId') userId: string){
        return userId
    }

    @ApiOperation({ summary: 'Register new user' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['email', 'password', 'name', 'surname'],
            properties: {
                email: {
                    type: 'string',
                    example: 'user@example.com',
                    description: 'User email address'
                },
                password: {
                    type: 'string',
                    example: 'secure-password',
                    description: 'User password'
                },
                name: {
                    type: 'string',
                    example: 'John',
                    description: 'User first name'
                },
                surname: {
                    type: 'string',
                    example: 'Doe',
                    description: 'User last name'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 201, 
        description: 'User registered successfully',
        schema: {
            example: {
                message: 'User created successfully'
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad Request - Invalid data or email already in use' })
    @Post('/register')
    async register(@Body() data: CreateUserDto, @Res() res: Response){
        const token = await this.authService.register(data);

        res.cookie('jwt', token.access_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.send({message: 'User created successfully'});
    }

    @ApiOperation({ summary: 'Login user' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
                email: {
                    type: 'string',
                    example: 'user@example.com',
                    description: 'User email address'
                },
                password: {
                    type: 'string',
                    example: 'secure-password',
                    description: 'User password'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'User logged in successfully',
        schema: {
            example: {
                user: "user_123456789"
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
    @Post('/login')
    async login(@Body() data: UserCredentialsDto, @Res() res: Response){
        const token = await this.authService.validateCredentials(data);

        res.cookie('jwt', token.access_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.send({user: token.user});
    }

    @ApiOperation({ summary: 'Logout user' })
    @ApiResponse({ 
        status: 200, 
        description: 'User logged out successfully',
        schema: {
            example: {
                message: 'User logged out successfully'
            }
        }
    })
    @ApiCookieAuth()
    @Post('/logout')
    async logout(@Res() res: Response){
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        return res.send({message: 'User logged out successfully'});
    }
}
