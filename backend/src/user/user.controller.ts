import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';


@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get(':email')
    findUserByEmail(@Param() emailObj: {email: string} ) {
        
        return this.userService.findUserByEmail(emailObj.email);
    }

}
