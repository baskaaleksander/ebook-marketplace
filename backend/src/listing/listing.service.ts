import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { CreateListingDto } from './dtos/create-listing.dto';
import { UpdateListingDto } from './dtos/update-listing.dto';
import { SearchFiltersDto } from './dtos/search-filters.dto';

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

        return this.prismaService.product.create({
            data: {
                title: data.title,
                description: data.description,
                price: data.price,
                fileUrl: data.fileUrl,
                seller: {
                    connect: { id: userId }  
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

    async getCategories() {
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

        return categories;
    }
    async getProductsByCategory(category: string) {
        const categoryName = decodeURIComponent(category);
        const listings = await this.prismaService.product.findMany({
            where: {
                categories: {
                    some: {
                        name: categoryName
                    }
                }
            },
            include: {
                categories: true,
                seller: true
            }
        });

        return listings;
    }

    async findUserListings(userId: string) {
        const listings = await this.prismaService.product.findMany({
            where: {
                sellerId: userId
            },
            include: {
                categories: true,
                seller: true
            }
        });
        
        return listings;
    }

    async getFeaturedListings() {
        const listings = await this.prismaService.product.findMany({
            where: {
                isFeatured: true
            },
            include: {
                categories: true,
                seller: true
            }
        });
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

async findListings(filters: SearchFiltersDto) {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
      isFeatured,
    } = filters;
  
    const where: any = {
    };
  
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { categories: { some: { name: { contains: query, mode: 'insensitive' } } } },
        { seller: { name: { contains: query, mode: 'insensitive' } } },
    ];
    }
  
    if (category) {
      where.categories = {
        some: {
          name: {
            contains: category,
            mode: 'insensitive'
          }
        }
      };
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
  
    const products = await this.prismaService.product.findMany({
        where,
        orderBy,
        include: {
          seller: true,          
        }
    });
  
    return products
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

    getRecentListings() {
        return this.prismaService.product.findMany({
            take: 10,
            orderBy: {
                createdAt: 'desc'
            }
        });
    }


}