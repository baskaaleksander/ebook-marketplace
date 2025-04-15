import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { Product } from "@prisma/client";

interface ProductWithFavourite extends Product {
    isFavourite?: boolean;
}

@Injectable() 
export class FavouritesService {
    constructor(private prismaService: PrismaService) {}

    async getFavorites(userId: string) {
        const favorites = await this.prismaService.favourite.findMany({
            where: { userId: userId },
        });

        const favouritesProducts = await Promise.all(
            favorites.map(async (favorite) => {
                const product = await this.prismaService.product.findUnique({
                    where: { id: favorite.productId },
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
                });

                (product as ProductWithFavourite).isFavourite = true;
                
                if (product) {
                    const { fileUrl, ...productWithoutFileUrl } = product;
                    return productWithoutFileUrl;
                }
                return null;
            })
        );
        
        return favouritesProducts.filter(product => product !== null);
    }

    async addFavorite(userId: string, productId: string) {
        const favorite = await this.prismaService.favourite.create({
            data: {
                productId,
                userId: userId,
            },
        });

        return favorite;
    }

    async removeFavorite(userId: string, productId: string) {
        const favorite = await this.prismaService.favourite.findFirst({
            where: {
                userId,
                productId,
            }
        });

        if (!favorite) {
            throw new NotFoundException('Favorite not found');
        }

        return this.prismaService.favourite.delete({
            where: {
                id: favorite.id,
            }
        });
    }
}