import { Injectable, NotFoundException } from "@nestjs/common";
import { Request } from "express";
import { PrismaService } from "src/prisma.service";

@Injectable() 
export class FavouritesService {
    constructor(private prismaService: PrismaService) {}

    async getFavorites(req: Request) {
        const favorites = await this.prismaService.favourite.findMany({
            where: { userId: req.user.userId },
        });

        return favorites;
    }

    async addFavorite(req: Request, productId: string) {
        const favorite = await this.prismaService.favourite.create({
            data: {
                productId,
                userId: req.user.userId,
            },
        });

        return favorite;
    }

    async removeFavorite(req: Request, productId: string) {
        const favorite = await this.prismaService.favourite.findFirst({
            where: {
                userId: req.user.userId,
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