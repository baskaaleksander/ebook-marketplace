import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dtos/create-user.dto';
import { AuthService } from './auth.service';
import { UserCredentialsDto } from './dtos/user-credentials.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/register')
    register(@Body() data: CreateUserDto){
        return this.authService.register(data);
    }

    @Post('/login')
    login(@Body() data: UserCredentialsDto){
        return this.authService.validateCredentials(data);
    }

}
