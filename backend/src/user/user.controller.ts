import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserService } from './user.service';
import { Request } from 'express';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get(':email')
    findUserByEmail(@Param() emailObj: {email: string} ) {
        
        return this.userService.findUserByEmail(emailObj.email);
    }

    @Get('/v1/whoami')
    whoAmI(@Req() req: Request) {
        return req.user.username;
    }
}
