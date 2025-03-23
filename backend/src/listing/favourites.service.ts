import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable() 
export class FavouritesService {
    constructor(private prismaService: PrismaService) {}

    async getFavorites(userId: string) {
        const favorites = await this.prismaService.favourite.findMany({
            where: { userId: userId },
        });

        return favorites;
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