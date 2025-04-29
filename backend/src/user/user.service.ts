import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UserService {
    constructor(
        private prismaService: PrismaService,
    ) {}

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

        await this.prismaService.user.update({
            where: { id },
            data: {
                ...data,
            }
        });

        return {
            data: {
                id: user.id,
                email: user.email,
                name: data.name || user.name,
                surname: data.surname || user.surname,
            }
        }
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
    

    async findUserById(id: string) {
        const user = await this.prismaService.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async deleteUser(id: string, currentUserId: string) {
        if (id !== currentUserId) {
            throw new UnauthorizedException('You are not authorized to delete this user');
        }

        const user = await this.prismaService.user.findUnique({
            where: { id },
            include: {
                products: true,
                orders: true,
                reviews: true,
                payouts: true,
                favourites: true,
                viewedListings: true
            }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prismaService.$transaction(async (prisma) => {

            await prisma.favourite.deleteMany({
                where: { userId: id }
            });


            await prisma.viewedListing.deleteMany({
                where: { userId: id }
            });
            

            await prisma.review.deleteMany({
                where: { buyerId: id }
            });
            

            for (const product of user.products) {

                await prisma.review.deleteMany({
                    where: { productId: product.id }
                });
                

                await prisma.viewedListing.deleteMany({
                    where: { productId: product.id }
                });
                

                const orders = await prisma.order.findMany({
                    where: { productId: product.id },
                    include: { refund: true }
                });
                
                for (const order of orders) {

                    if (order.refund) {
                        await prisma.refund.delete({
                            where: { id: order.refund.id }
                        });
                    }
                    

                    await prisma.order.delete({
                        where: { id: order.id }
                    });
                }
            }
            
            await prisma.product.deleteMany({
                where: { sellerId: id }
            });

            const userOrders = await prisma.order.findMany({
                where: { buyerId: id },
                include: { refund: true }
            });
            
            for (const order of userOrders) {
                if (order.refund) {
                    await prisma.refund.delete({
                        where: { id: order.refund.id }
                    });
                }
                
                await prisma.order.delete({
                    where: { id: order.id }
                });
            }
            
            await prisma.payout.deleteMany({
                where: { userId: id }
            });
            
            await prisma.user.delete({
                where: { id }
            });
            
            return {
                message: 'User and all related data deleted successfully'
            };
        });
    }
}
