import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dtos/create-listing.dto';
import { UpdateListingDto } from './dtos/update-listing.dto';
import { ReviewService } from './review.service';
import { ReviewOrderDto } from './dtos/review-order.dto';
import { FavouritesService } from './favourites.service';
import { ViewedListingsService } from './viewedListing.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';


@Controller('listing')
export class ListingController {
    constructor(
        private listingService: ListingService, 
        private reviewService: ReviewService,
        private favouritesService: FavouritesService,
        private viewedListingsService: ViewedListingsService
    ){}
    @Get(':id')
    findListingById(@Param('id') param: string) {
        return this.listingService.findListingById(param);
    }

    @Get()
    findAllListings() {
        return this.listingService.findAllListings();
    }

    @Get('recent')
    findRecentListings() {
        return this.listingService.getRecentListings();
    }

    //TODO: Implement search functionality
    @Get('search')
    searchListings() {
        return 'this.listingService.findListings(filterQuery)';
    }


    @Get(':id/reviews')
    getReviews(@Param('id') param: string ) {
        return this.reviewService.getReviews(param);
    }

    @Get('reviews/:reviewId')
    getReview(@Param('reviewId') reviewId: string) {
        return this.reviewService.getReview(reviewId);
    }

    @UseGuards(AuthGuard('jwt')) 
    @Post()
    createListing(@Body() body: CreateListingDto, @CurrentUser('userId') userId: string) {
        return this.listingService.createListing(body, userId);
    }

    @Post(':id/reviews')
    createReview(@Param('id') param: string, @CurrentUser('userId') userId: string, @Body() data: ReviewOrderDto) {
        return this.reviewService.createReview(param, userId, data);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    updateListing(@Param('id') param: string, @Body() updateListingDto: UpdateListingDto, @CurrentUser('userId') userId: string) {
        return this.listingService.updateListing(param, updateListingDto, userId);
    }

    @Put('reviews/:reviewId')
    updateReview(@Param('reviewId') param: string, @Body() body: ReviewOrderDto, @CurrentUser('userId') userId: string) {
        return this.reviewService.updateReview(param, body, userId);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    deleteListing(@Param('id') param: string, @Body() updateListingDto: UpdateListingDto, @CurrentUser('userId') userId: string) {
        return this.listingService.deleteListing(param, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('reviews/:reviewId')
    deleteReview(@Param('reviewId') param: string, @CurrentUser('userId') userId: string) {
        return this.reviewService.deleteReview(param, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('favorites/:id')
    addFavorite(@Param('id') param: string, @CurrentUser('userId') userId: string) {
        return this.favouritesService.addFavorite(userId, param);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('favorites/:id')
    removeFavorite(@Param('id') param: string, @CurrentUser('userId') userId: string) {
        return this.favouritesService.removeFavorite(userId, param);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('favorites')
    getFavorites(@CurrentUser('userId') userId: string) {
        return this.favouritesService.getFavorites(userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/view')
    trackListingView(@Param('id') param: string, @CurrentUser('userId') userId: string) {
        return this.viewedListingsService.trackListingView(userId, param);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('viewed')
    getViewedProducts(@CurrentUser('userId') userId: string) {
        return this.viewedListingsService.getViewedProducts(userId);
    }

    
}
