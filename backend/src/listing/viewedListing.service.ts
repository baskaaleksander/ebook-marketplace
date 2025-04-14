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

        return await this.prismaService.product.update({
            where: { id: productId},
            data: {
                views: {
                    increment: 1
                }
            }
        })

    }
    async getViewedProducts(userId: string) {
        const viewed = await this.prismaService.viewedListing.findMany({
            where: {
                userId
            },
            orderBy: {
                viewedAt: 'desc'
            },
            take: 10,
            include: {
                product: true
            }
        })
        const viewedProducts = await Promise.all(
            viewed.map(async (viewedListing) => {
                const product = await this.prismaService.product.findUnique({
                    where: { id: viewedListing.productId },
                    include: {
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
            )
                return product;
            })
        );
        
        return viewedProducts;

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