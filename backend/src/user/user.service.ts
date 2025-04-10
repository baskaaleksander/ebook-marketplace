import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService) {}

    async createUser(data: CreateUserDto) {
        return this.prismaService.user.create({ data });
    }

    async updateUser(id: string, data: Partial<CreateUserDto>) {
        const user = await this.prismaService.user.findUnique({
            where: { id }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prismaService.user.update({
            where: { id },
            data
        });
    }

    async reviewAvgRatings(id: string) {
        const user = await this.prismaService.user.findUnique({
            where: { id },
            include: { reviews: true }
        });
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const totalRatings = user.reviews.reduce((acc, review) => acc + review.rating, 0);
        const avgRating = totalRatings / user.reviews.length || 0;

        return { averageRating: avgRating };
    }
    
    async findUserListings(id: string) {
        const user = await this.prismaService.user.findUnique({
            where: { id },
            include: { products: true }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user.products;
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
    async findUserById(id: string) {
        const user = await this.prismaService.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }
}
