import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { CreateListingDto } from './dtos/create-listing.dto';
import { UpdateListingDto } from './dtos/update-listing.dto';import { Product } from '@prisma/client';
import { SearchQueryDto } from 'src/dtos/search-query.dto';

interface ProductWithFavourite extends Product {
    isFavourite?: boolean;
}
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

    async createListing(data: CreateListingDto, userId: string) {
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
        
        if (!userId) {
            throw new NotFoundException('User ID is required');
        }
        
        const seller = await this.prismaService.user.findUnique({
            where: { id: userId }
        });

        if (seller?.stripeStatus === "unverified") {
            throw new UnauthorizedException('Seller is not verified');
        }

        await this.prismaService.product.create({
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
                fileUrl: data.fileUrl,
                imageUrl: data.imageUrl,
                seller: {
                    connect: { id: userId }  
                },
                categories: categoryConnections
            },
            include: {
                categories: true,
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

        return {
            message: 'Listing created successfully',
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
                fileUrl: data.fileUrl,
                imageUrl: data.imageUrl,
                sellerId: userId,
                categories: categoryConnections
            }
        }
    }
    
    async findListingById(id: string, userId?: string) {

        const listing = await this.prismaService.product.findUnique({
            where: {
                id: id
            },
            include: {
                categories: true,
                reviews: true,
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

        


        if(userId) {
            const favourite = await this.prismaService.favourite.findFirst({
                where: {
                    userId: userId,
                    productId: id
                }
            });

            (listing as ProductWithFavourite).isFavourite = !!favourite;
        }
        

        if(!listing){
            throw new NotFoundException('Listing not found');
        }

        if(listing.sellerId == userId){
            return listing;
        }

        const { fileUrl, ...listingWithoutFile } = listing;
        return listingWithoutFile;
    }

    async findListings(filters: SearchQueryDto, userId?: string) {
        const {
            query,
            category,
            minPrice,
            maxPrice,
            sortBy,
            sortOrder,
            isFeatured,
        } = filters;
    
        const where: any = {};
    
        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { categories: { some: { name: { contains: query, mode: 'insensitive' } } } },
                { seller: { name: { contains: query, mode: 'insensitive' } } },
            ];
        }
    
        if (category) {
            if(category !== 'all'){
                where.categories = {
                    some: {
                        name: {
                            contains: category,
                            mode: 'insensitive'
                        }
                    }
                };
            }

        }
    
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            
            if (minPrice !== undefined) {
                where.price.gte = minPrice;
            }
            
            if (maxPrice !== undefined) {
                where.price.lte = maxPrice;
            }
        }
    
        if (isFeatured !== undefined) {
            where.isFeatured = isFeatured;
        }
    
        const orderBy: any = {};
        if (sortBy) {
            orderBy[sortBy] = sortOrder || 'desc';
        }
    
        const listings  = await 
            this.prismaService.product.findMany({
                take: filters.limit || 10,
                skip: filters.page ? (filters.page - 1) * (filters.limit || 10) : 0,
                where,
                orderBy,
                include: {
                    seller: true
                }
            })

        
        const listingsWithFavourites = await Promise.all(
            listings.map(async (listing) => {

                
                if (userId) {
                    const favourite = await this.prismaService.favourite.findFirst({
                        where: {
                            userId: userId,
                            productId: listing.id
                        }
                    });

        
                    return {
                        id: listing.id,
                        title: listing.title,
                        price: listing.price,
                        description: listing.description,
                        imageUrl: listing.imageUrl,
                        createdAt: listing.createdAt,
                        updatedAt: listing.updatedAt,
                        sellerId: listing.sellerId,
                        isFavourite: !!favourite,
                        seller: {
                            id: listing.seller.id,
                            name: listing.seller.name,
                            surname: listing.seller.surname,
                        }
                    };
                }
                return {
                    id: listing.id,
                    title: listing.title,
                    price: listing.price,
                    description: listing.description,
                    imageUrl: listing.imageUrl,
                    createdAt: listing.createdAt,
                    updatedAt: listing.updatedAt,
                    sellerId: listing.sellerId,
                    isFavourite: false,
                    seller: {
                        id: listing.seller.id,
                        name: listing.seller.name,
                        surname: listing.seller.surname,
                    }

                };
            })
        );

        const totalCount = listingsWithFavourites.length;
        
        return {
            data: {
                listings: listingsWithFavourites,
                totalCount: totalCount,
                totalPages: Math.ceil(totalCount / (filters.limit || 10)),
                currentPage: filters.page || 1
            },
            message: 'Listings fetched successfully'
        };
    }

    async getCategories(userId?: string) {
        const categories = await this.prismaService.category.findMany({
            include: {
                products: {
                    take: 4,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        seller: true
                    }
                }
            }
        });

        const processedCategories = await Promise.all(categories.map(async category => {

            const processedProducts = await Promise.all(category.products.map(async product => {                
                if (userId) {
                    const favourite = await this.prismaService.favourite.findFirst({
                        where: {
                            userId: userId,
                            productId: product.id
                        }
                    });
                    
                    return {
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        description: product.description,
                        imageUrl: product.imageUrl,
                        createdAt: product.createdAt,
                        updatedAt: product.updatedAt,
                        sellerId: product.sellerId,
                        isFavourite: !!favourite,
                        seller: {
                            id: product.seller.id,
                            name: product.seller.name,
                            surname: product.seller.surname,
                        }

                    };
                }
                return {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    description: product.description,
                    imageUrl: product.imageUrl,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt,
                    sellerId: product.sellerId,
                    isFavourite: false,
                    seller: {
                        id: product.seller.id,
                        name: product.seller.name,
                        surname: product.seller.surname,
                    }

                };
            }));
            
            return {
                ...category,
                products: processedProducts
            };
        }));

        return {
            data: processedCategories,
            message: 'Categories fetched successfully'
        };
    }

    async findUserListings(userId: string, currentUserId?: string) {
        const listings = await this.prismaService.product.findMany({
            where: {
                sellerId: userId
            },
            include: {
                categories: true,
                seller: true
            }
        });
        
        const listingsWithFavourites = await Promise.all(
            listings.map(async (product) => {
                
                if (currentUserId) {
                    const favourite = await this.prismaService.favourite.findFirst({
                        where: {
                            userId: currentUserId,
                            productId: product.id
                        }
                    });
                    
                    return {
                            id: product.id,
                            title: product.title,
                            price: product.price,
                            description: product.description,
                            imageUrl: product.imageUrl,
                            createdAt: product.createdAt,
                            updatedAt: product.updatedAt,
                            sellerId: product.sellerId,
                            isFavourite: !!favourite,
                            seller: {
                                id: product.seller.id,
                                name: product.seller.name,
                                surname: product.seller.surname,
                            }
                        };
                }
                
                return {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    description: product.description,
                    imageUrl: product.imageUrl,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt,
                    sellerId: product.sellerId,
                    isFavourite: false,
                    seller: {
                        id: product.seller.id,
                        name: product.seller.name,
                        surname: product.seller.surname,
                    }
                };
            })
        );
        
        return {
            data: listingsWithFavourites,
            message: 'Listings fetched successfully'
        };
    }

    async getFeaturedListings(userId?: string) {
        const listings = await this.prismaService.product.findMany({
            where: {
                isFeatured: true
            },
            include: {
                categories: true,
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
        
        if(listings.length === 0){
            throw new NotFoundException('No listings found');
        }
        
        const listingsWithFavourites = await Promise.all(
            listings.map(async (product) => {
                
                if (userId) {
                    const favourite = await this.prismaService.favourite.findFirst({
                        where: {
                            userId: userId,
                            productId: product.id
                        }
                    });
                    
                    return {
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        description: product.description,
                        imageUrl: product.imageUrl,
                        createdAt: product.createdAt,
                        updatedAt: product.updatedAt,
                        sellerId: product.sellerId,
                        isFavourite: !!favourite,
                        isFeatured: product.isFeatured,
                        featuredForTime: product.featuredForTime,
                        seller: {
                            id: product.seller.id,
                            name: product.seller.name,
                            surname: product.seller.surname,
                        }
                    };
                }
                
                return {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    description: product.description,
                    imageUrl: product.imageUrl,
                    createdAt: product.createdAt,
                    updatedAt: product.updatedAt,
                    sellerId: product.sellerId,
                    isFavourite: false,
                    isFeatured: product.isFeatured,
                    featuredForTime: product.featuredForTime,
                    seller: {
                        id: product.seller.id,
                        name: product.seller.name,
                        surname: product.seller.surname,
                    }
                };
            })
        );
        
        return {
            data: listingsWithFavourites,
            message: 'Featured listings fetched successfully'
        };
    }


    async deleteListing(id: string, userId: string) {

        const listing = await this.prismaService.product.findUnique({
            where: {
                id: id
            }
        });

        if(!listing){
            throw new NotFoundException('Listing not found');
        }

        if(listing.sellerId !== userId){
            throw new UnauthorizedException('You are not the owner of this listing');
        }

        await this.prismaService.favourite.deleteMany({
            where: {
                productId: id
            }
        });

        await this.prismaService.viewedListing.deleteMany({
            where: {
                productId: id
            }
        });
        await this.prismaService.review.deleteMany({
            where: {
                productId: id
            }
        });

        return this.prismaService.product.delete({
            where: {
                id: id
            }
        });
    }

    async updateListing(id: string, body: UpdateListingDto, userId: string){ {

        const listing = await this.prismaService.product.findUnique({
            where: {
                id: id
            }
        });
        

        if(!listing){
            throw new NotFoundException('Listing not found');
        }

        if (listing.sellerId !== userId) {
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