import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService) {}

    async createUser(data: CreateUserDto) {
        return this.prismaService.user.create({ data });
    }



    async findUserByEmail(email: string) {
        const user = await this.prismaService.user.findUnique({
            where: { email },
            include: { 
                products: true,
                reviews: true,
                orders: true,
                payouts: true
             }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }
}
