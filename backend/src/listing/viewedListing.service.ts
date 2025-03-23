import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class ViewedListingsService {
    constructor(
        private prismaService: PrismaService
    ) {}

    async trackListingView(userId: string, productId: string) {
        const product = await this.prismaService.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }

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
    async getViewedProducts(userId: string) {
        return this.prismaService.viewedListing.findMany({
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
}