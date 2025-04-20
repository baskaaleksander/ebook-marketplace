import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dtos/create-listing.dto';
import { UpdateListingDto } from './dtos/update-listing.dto';
import { ReviewService } from './review.service';
import { ReviewOrderDto } from './dtos/review-order.dto';
import { FavouritesService } from './favourites.service';
import { ViewedListingsService } from './viewedListing.service';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Request } from 'express';
import { OptionalAuthGuard } from '../guards/optional-auth.guard';
import { AnalyticsService } from './analytics.service';
import { SearchQueryDto } from 'src/dtos/search-query.dto';

@Controller('listing')
export class ListingController {
    constructor(
        private listingService: ListingService, 
        private reviewService: ReviewService,
        private favouritesService: FavouritesService,
        private viewedListingsService: ViewedListingsService,
        private analyticsService: AnalyticsService
    ){}

    @UseGuards(OptionalAuthGuard)
    @Get()
    findListings(@Query() filters: SearchQueryDto, @CurrentUser('userId') userId?: string) {
        return this.listingService.findListings(filters, userId);
    }
    
    @UseGuards(AuthGuard('jwt')) 
    @Post()
    createListing(@Body() body: CreateListingDto, @CurrentUser('userId') userId: string) {
        return this.listingService.createListing(body, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('analytics')
    getAnalytics(@CurrentUser('userId') userId: string) {
        return this.analyticsService.getUserAnalytics(userId);
    }

    @UseGuards(OptionalAuthGuard)
    @Get('featured')
    findFeaturedListings(@CurrentUser('userId') userId?: string) {
        return this.listingService.getFeaturedListings(userId);
    }
    
    @UseGuards(OptionalAuthGuard)
    @Get('categories')
    getCategories(@CurrentUser('userId') userId?: string) {
        return this.listingService.getCategories(userId);
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Get('favourites') 
    getFavorites(@CurrentUser('userId') userId: string) {
        return this.favouritesService.getFavorites(userId);
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Get('viewed')
    getViewedProducts(@CurrentUser('userId') userId: string) {
        return this.viewedListingsService.getViewedProducts(userId);
    }
    
    @UseGuards(OptionalAuthGuard)
    @Get('user/:userId')
    findUserListings(@Param('userId') userId: string, @CurrentUser('userId') currentUserId?: string) {
        return this.listingService.findUserListings(userId, currentUserId);
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Post('favourites/:id')
    addFavorite(@Param('id') param: string, @CurrentUser('userId') userId: string) {
        return this.favouritesService.addFavorite(userId, param);
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Delete('favourites/:id')
    removeFavorite(@Param('id') param: string, @CurrentUser('userId') userId: string) {
        return this.favouritesService.removeFavorite(userId, param);
    }
    
    @Get('reviews/:reviewId')
    getReview(@Param('reviewId') reviewId: string) {
        return this.reviewService.getReview(reviewId);
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Put('reviews/:reviewId')
    updateReview(@Param('reviewId') param: string, @Body() body: ReviewOrderDto, @CurrentUser('userId') userId: string) {
        return this.reviewService.updateReview(param, body, userId);
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Delete('reviews/:reviewId')
    deleteReview(@Param('reviewId') param: string, @CurrentUser('userId') userId: string) {
        return this.reviewService.deleteReview(param, userId);
    }
    
    @UseGuards(OptionalAuthGuard)
    @Get(':id')
    findListingById(@Param('id') param: string, @CurrentUser('userId') userId?: string) {
        return this.listingService.findListingById(param, userId);
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    updateListing(@Param('id') param: string, @Body() updateListingDto: UpdateListingDto, @CurrentUser('userId') userId: string) {
        return this.listingService.updateListing(param, updateListingDto, userId);
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    deleteListing(@Param('id') param: string, @CurrentUser('userId') userId: string) {
        return this.listingService.deleteListing(param, userId);
    }
    
    @Get(':id/views')
    getProductViews(@Param('id') param: string) {
        return this.viewedListingsService.getProductViews(param);
    }
    
    @Get(':id/reviews')
    getReviews(@Param('id') param: string) {
        return this.reviewService.getReviews(param);
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Post(':id/reviews')
    createReview(@Param('id') param: string, @CurrentUser('userId') userId: string, @Body() data: ReviewOrderDto) {
        return this.reviewService.createReview(param, userId, data);
    }
    
    @Post(':id/view')
    trackListingView(@Param('id') param: string, @Req() req: Request) {
        const userId = req.user?.userId || null;
        return this.viewedListingsService.trackListingView(userId, param);
    }
}
