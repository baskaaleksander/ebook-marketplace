import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService) {}

    async createUser(data: CreateUserDto) {
        return this.prismaService.user.create({ data });
    }

    async findUserById(id: any) {
        
        return this.prismaService.user.findUnique({
            where: id,
        });
    }
}
