import { Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { CreateListingDto } from './dtos/create-listing.dto';

declare module 'express' {
    interface Request {
        user: {
            username: string;
            userId: string;
        }
    }
}

@Injectable()
export class ListingService {
    constructor (private readonly prismaService: PrismaService, private readonly userService: UserService) {}

    async createListing(data: CreateListingDto, req: Request) {
        let categoryConnections;
        if (data.categories && data.categories.length > 0) {
            const categoryPromises = data.categories.map(async (category) => {
                const existingCategory = await this.prismaService.category.findFirst({
                    where: { name: category.name }
                });
                
                if (existingCategory) {
                    return { id: existingCategory.id };
                }
                    
                const newCategory = await this.prismaService.category.create({
                    data: { name: category.name }
                });
                    
                return { id: newCategory.id };
            });
                
            const categoryIds = await Promise.all(categoryPromises);
            categoryConnections = { connect: categoryIds };
        }
        
        if (!req.user.userId) {
            throw new NotFoundException('User ID is required');
        }
        
        return this.prismaService.product.create({
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
                fileUrl: data.fileUrl,
                seller: {
                    connect: { id: req.user.userId }  
                },
                categories: categoryConnections
            },
            include: {
                categories: true,
                seller: true  
            }
        });
    }
    
    findListingById(id: string) {
        return this.prismaService.product.findUnique({
            where: {
                id: id
            },
            include: {
                categories: true
            }
        });
    }

    findAllListings() {
        return this.prismaService.product.findMany();
    }

    searchListingsFromCategory(category: string, query: any) {
        return this.prismaService.product.findMany({
            where: {
                categories: {
                    some: {
                        name: category
                    }
                }
            },
            take: query.take || 10,
        });
    }

}
