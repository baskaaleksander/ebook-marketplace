import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class ViewedListingsService {
    constructor(
        private prismaService: PrismaService
    ) {}

    async trackListingView(userId: string | null, productId: string) {
        const product = await this.prismaService.product.findUnique({
            where: { id: productId }
        });

        

        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        if(userId) {
            await this.prismaService.viewedListing.upsert({
                where: {
                    userId_productId: {
                        userId,
                        productId
                    }
                },
                update: {
                    viewedAt: new Date()
                },
                create: {
                    userId,
                    productId,
                }
            });
        }

        await this.prismaService.product.update({
            where: { id: productId},
            data: {
                views: {
                    increment: 1
                }
            }
        })

    }
    // remove fileUrl from the product object, add isFavourite property
    async getViewedProducts(userId: string) {
        const viewed = await this.prismaService.viewedListing.findMany({
            where: { userId },
            orderBy: { viewedAt: 'desc' },
            take: 10,
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        price: true,
                        imageUrl: true,
                        sellerId: true,
                        seller: {
                            select: {
                                id: true,
                                name: true,
                                surname: true,
                                email: true,
                                avatarUrl: true,
                                stripeStatus: true,
                                createdAt: true,
                            }
                        }
                    }
                }
            }
        });
    
        return {
            data: viewed.map((viewed) => ({
                id: viewed.product.id,
                title: viewed.product.title,
                description: viewed.product.description,
                price: viewed.product.price,
                imageUrl: viewed.product.imageUrl,
                sellerId: viewed.product.sellerId,
                seller: {
                    id: viewed.product.seller.id,
                    name: viewed.product.seller.name,
                    surname: viewed.product.seller.surname,
                    email: viewed.product.seller.email,
                    avatarUrl: viewed.product.seller.avatarUrl,
                    stripeStatus: viewed.product.seller.stripeStatus,
                    createdAt: viewed.product.seller.createdAt
                }
            })),
            message: 'Viewed products retrieved successfully',
        }
    }
    
    async clearViewedProducts() {
        const result = await this.prismaService.viewedListing.deleteMany({
            where: {
                viewedAt: {
                    lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 30)
                }
            }
        })

        return result.count;
    }

    async getProductViews(productId: string) {
        const product = await this.prismaService.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

        return product.views;
    }
}