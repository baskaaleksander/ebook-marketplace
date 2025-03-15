import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

declare module 'express' {
    interface Request {
        userId: string;
        username: string;
    }
}

@Injectable()
export class ListingService {
    constructor (private readonly prismaService: PrismaService, private readonly userService: UserService) {}

    createListing(data: any, req: Request) {
        
        return this.prismaService.product.create({
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
                fileUrl: data.fileUrl,
                sellerId: req.userId,
                categories: {
                    connect: data.categories
                }
            }
        })
    }

    findListingById(id: string) {
        return this.prismaService.product.findUnique({
            where: {
                id: id
            }
        });
    }

    findAllListings() {
        return this.prismaService.product.findMany();
    }

    // async searchListings(category: string, query: any) {
    //     const categoriesSearch = await this.prismaService.category.findUnique({
    //         where: { name: category }
    //     });

    //     if (!categoriesSearch) {
    //         throw new NotFoundException('Category not found');
    //     }

    //     return this.prismaService.product.findMany({
    //         where: {
    //             categories: categoriesSearch
    //         }
    //     });
    // }
}
