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
    createListing(@Body() body: CreateListingDto, @Req() req: Request) {
        return this.listingService.createListing(body, req.user.userId);
    }

    @Post(':id/reviews')
    createReview(@Param('id') param: string, @Req() req: Request, @Body() data: ReviewOrderDto) {
        return this.reviewService.createReview(param, req.user.userId, data);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    updateListing(@Param('id') param: string, @Body() updateListingDto: UpdateListingDto, @Req() req: Request) {
        return this.listingService.updateListing(param, updateListingDto, req.user.userId);
    }

    @Put('reviews/:reviewId')
    updateReview(@Param('reviewId') param: string, @Body() body: ReviewOrderDto, @Req() req: Request) {
        return this.reviewService.updateReview(param, body, req.user.userId);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    deleteListing(@Param('id') param: string, @Body() updateListingDto: UpdateListingDto, @Req() req: Request) {
        return this.listingService.deleteListing(param, req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('reviews/:reviewId')
    deleteReview(@Param('reviewId') param: string, @Req() req: Request) {
        return this.reviewService.deleteReview(param, req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('favorites/:id')
    addFavorite(@Param('id') param: string, @Req() req: Request) {
        return this.favouritesService.addFavorite(req.user.userId, param);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('favorites/:id')
    removeFavorite(@Param('id') param: string, @Req() req: Request) {
        return this.favouritesService.removeFavorite(req.user.userId, param);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('favorites')
    getFavorites(@Req() req: Request) {
        return this.favouritesService.getFavorites(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/view')
    trackListingView(@Param('id') param: string, @Req() req: Request) {
        return this.viewedListingsService.trackListingView(req.user.userId, param);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('viewed')
    getViewedProducts(@Req() req: Request) {
        return this.viewedListingsService.getViewedProducts(req.user.userId);
    }

    
}
