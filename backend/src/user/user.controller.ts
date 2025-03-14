import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Post()
    createUser(@Body() data: CreateUserDto){
        return this.userService.createUser(data);
    }

    @Get(':id')
    findUserById(@Param() id: string) {
        return this.userService.findUserById(id);
    }
}
