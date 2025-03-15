import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get(':email')
    findUserByEmail(@Param() data: { email: string }) {
        return this.userService.findUserByEmail(data.email);
    }
}
