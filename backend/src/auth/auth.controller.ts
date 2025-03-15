import { Body, Controller, Post, Res } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';
import { AuthService } from './auth.service';
import { UserCredentialsDto } from './dtos/user-credentials.dto';
import { Response } from 'express';
import { stat } from 'fs';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/register')
    async register(@Body() data: CreateUserDto, @Res() res: Response){
        const token = await this.authService.register(data);

        res.cookie('jwt', token.access_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
          });

        return res.send({message: 'User created successfully'});
    }

    @Post('/login')
    async login(@Body() data: UserCredentialsDto, @Res() res: Response){
        const token = await this.authService.validateCredentials(data);

        res.cookie('jwt', token.access_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000,
          });

        return res.send({message: 'User created successfully'});

    }

}
