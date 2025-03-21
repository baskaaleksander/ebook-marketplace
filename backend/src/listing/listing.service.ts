import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { CreateListingDto } from './dtos/create-listing.dto';
import { UpdateListingDto } from './dtos/update-listing.dto';

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
        
        const seller = await this.prismaService.user.findUnique({
            where: { id: req.user.userId }
        });

        if (seller?.stripeStatus === "unverified") {
            throw new UnauthorizedException('Seller is not verified');
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
    
    async findListingById(id: string) {
        const listing = await this.prismaService.product.findUnique({
            where: {
                id: id
            },
            include: {
                categories: true
            }
        });

        if(!listing){
            throw new NotFoundException('Listing not found');
        }

        return listing;
    }

    async findAllListings() {
        const listings = await this.prismaService.product.findMany();

        if(listings.length === 0){
            throw new NotFoundException('No listings found');
        }

        return listings;
    }

    async searchListingsFromCategory(category: string, take: string) {
        const listings = await this.prismaService.product.findMany({
            where: {
                categories: {
                    some: {
                        name: category
                    }
                }
            },
            take: parseInt(take) || 10,
        });

        if(listings.length === 0){
            throw new NotFoundException('No listings found');
        }

        return listings;
    }

    async deleteListing(id: string, req: Request) {

        const listing = await this.prismaService.product.findUnique({
            where: {
                id: id
            }
        });

        if(!listing){
            throw new NotFoundException('Listing not found');
        }

        if(listing.sellerId !== req.user.userId){
            throw new UnauthorizedException('You are not the owner of this listing');
        }

        return this.prismaService.product.delete({
            where: {
                id: id
            }
        });
    }

    async updateListing(id: string, body: UpdateListingDto, req: Request){ {

        const listing = await this.prismaService.product.findUnique({
            where: {
                id: id
            }
        });
        

        if(!listing){
            throw new NotFoundException('Listing not found');
        }

        if (listing.sellerId !== req.user.userId) {
            throw new UnauthorizedException('You are not the owner of this listing');
        }

        let categoryConnections;
        if (body.categories && body.categories.length > 0) {
            const categoryPromises = body.categories.map(async (category) => {
                const categoryName = typeof category === 'string' ? category : category.name;
                
                if (!categoryName) {
                    return null;
                }
                
                const existingCategory = await this.prismaService.category.findFirst({
                    where: { name: categoryName }
                });
                
                if (existingCategory) {
                    return { id: existingCategory.id };
                }
                    
                const newCategory = await this.prismaService.category.create({
                    data: { name: categoryName }
                });
                    
                return { id: newCategory.id };
            });
                
            const categoryIds = await Promise.all(categoryPromises);
            const validCategoryIds = categoryIds.filter(id => id !== null);
            
            if (validCategoryIds.length > 0) {
                categoryConnections = { 
                    set: [], 
                    connect: validCategoryIds 
                };
            }
        }
        
        const { categories, ...updateData } = body;
        
        return this.prismaService.product.update({
            where: {
                id: id
            },
            data: {
                ...updateData,
                ...(categoryConnections && { categories: categoryConnections })
            },
            include: {
                categories: true,
                seller: true
            }
        });
    }
}
}
