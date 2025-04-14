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
            data: {
                ...data,
            }
        });
    }

    async getUserReviews(userId: string) {
        const reviews = await this.prismaService.review.findMany({
            where: { product:
                { sellerId: userId }
             },
             include: { buyer: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    surname: true,
                    avatarUrl: true,
                }
            } }
        });

        return reviews;
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
    
    async findUserListings(id: string, includeFileUrl: boolean) {
        const user = await this.prismaService.user.findUnique({
            where: { id },
            include: { products: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    price: true,
                    imageUrl: true,
                    fileUrl: includeFileUrl ? true : false,
                    isFeatured: true,
                    sellerId: true,
                    reviews: true,
                    createdAt: true,
                }
            } 
        }
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
