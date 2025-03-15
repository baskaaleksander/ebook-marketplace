import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService) {}

    async createUser(data: CreateUserDto) {
        return this.prismaService.user.create({ data });
    }

    async findUserByEmail(data: string) {
        
        const user =  this.prismaService.user.findUnique({
            where: { email: data },
        });

        if(!user){
            return null;
        }
        return user;
    }
}
