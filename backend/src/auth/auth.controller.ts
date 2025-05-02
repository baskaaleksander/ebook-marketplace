import { Body, Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { AuthService } from './auth.service';
import { UserCredentialsDto } from './dtos/user-credentials.dto';
import { Request, Response } from 'express';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dtos/change-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}


    @Post('/change-password')
    @UseGuards(AuthGuard('jwt'))
    async changePassword(@Body() data: ChangePasswordDto, @CurrentUser('userId') userId: string){
        return this.authService.changePassword(userId, data);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/me')
    async me(@CurrentUser('userId') userId: string){
        return userId
    }


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
