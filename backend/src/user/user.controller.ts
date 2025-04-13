import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserResponseDto } from './dtos/user-response.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { AuthGuard } from '@nestjs/passport';


@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    
    @Get('/id/:id')
    @Serialize(UserResponseDto)
    findUserById(@Param() idObj: {id: string} ) {
        
        return this.userService.findUserById(idObj.id);
    }
    @Get(':email')
    @Serialize(UserResponseDto)
    findUserByEmail(@Param() emailObj: {email: string} ) {
        
        return this.userService.findUserByEmail(emailObj.email);
    }

    @Get(':id/reviews')
    getUserReviews(@Param() idObj: {id: string} ) {
        return this.userService.getUserReviews(idObj.id);
    }

    @Get(':id/listings')
    @Serialize(UserResponseDto)
    findUserListings(@Param() idObj: {id: string} ) {
        return this.userService.findUserListings(idObj.id);
    }

    @Get('avgratings/:id')
    reviewAvgRatings(@Param() idObj: {id: string} ) {
        return this.userService.reviewAvgRatings(idObj.id);
    }

    @Put('/:id')
    @Serialize(UserResponseDto)
    @UseGuards(AuthGuard('jwt'))
    updateUser(@Param() idObj: {id: string}, @Body() body: Partial<CreateUserDto>) {
        return this.userService.updateUser(idObj.id, body);
    }

}
