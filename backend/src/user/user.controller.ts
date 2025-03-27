import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserResponseDto } from './dtos/user-response.dto';


@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get(':email')
    @Serialize(UserResponseDto)
    findUserByEmail(@Param() emailObj: {email: string} ) {
        
        return this.userService.findUserByEmail(emailObj.email);
    }

}
