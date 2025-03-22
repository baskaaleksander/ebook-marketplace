import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dtos/create-listing.dto';
import { UpdateListingDto } from './dtos/update-listing.dto';
import { ReviewService } from './review.service';
import { ReviewOrderDto } from './dtos/review-order.dto';
import { FilterQueryDto } from './dtos/filter-query.dto';
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
    findListingById(@Param() param: {id: string}) {
        return this.listingService.findListingById(param.id);
    }

    @Get()
    findAllListings() {
        return this.listingService.findAllListings();
    }

    @Get('recent')
    findRecentListings() {
        return this.listingService.getRecentListings();
    }

    @Get('search')
    searchListings(@Query() filterQuery: FilterQueryDto) {
        return '.';
    }


    @Get(':id/reviews')
    getReviews(@Param() param: {id: string} ) {
        return this.reviewService.getReviews(param.id);
    }

    @Get('reviews/:reviewId')
    getReview(@Param() data: { reviewId: string }) {
        return this.reviewService.getReview(data.reviewId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    createListing(@Body() body: CreateListingDto, @Req() req: Request) {
        return this.listingService.createListing(body, req.user.userId);
    }

    @Post(':id/reviews')
    createReview(@Param() param: { id: string }, @Req() req: Request, @Body() data: ReviewOrderDto) {
        return this.reviewService.createReview(param.id, req.user.userId, data);
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    updateListing(@Param() param: { id: string }, @Body() updateListingDto: UpdateListingDto, @Req() req: Request) {
        return this.listingService.updateListing(param.id, updateListingDto, req.user.userId);
    }

    @Put('reviews/:reviewId')
    updateReview(@Param() data: { reviewId: string }, @Body() body: ReviewOrderDto, @Req() req: Request) {
        return this.reviewService.updateReview(data.reviewId, body, req.user.userId);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    deleteListing(@Param()param: { id: string }, @Body() updateListingDto: UpdateListingDto, @Req() req: Request) {
        return this.listingService.deleteListing(param.id, req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('reviews/:reviewId')
    deleteReview(@Param() data: { id: string, reviewId: string }, @Req() req: Request) {
        return this.reviewService.deleteReview(data.reviewId, req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('favorites/:id')
    addFavorite(@Param() param: { id: string }, @Req() req: Request) {
        return this.favouritesService.addFavorite(req.user.userId, param.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('favorites/:id')
    removeFavorite(@Param() param: { id: string }, @Req() req: Request) {
        return this.favouritesService.removeFavorite(req.user.userId, param.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('favorites')
    getFavorites(@Req() req: Request) {
        return this.favouritesService.getFavorites(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/view')
    trackListingView(@Param() param: { id: string }, @Req() req: Request) {
        return this.viewedListingsService.trackListingView(req.user.userId, param.id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('viewed')
    getViewedProducts(@Req() req: Request) {
        return this.viewedListingsService.getViewedProducts(req.user.userId);
    }

    
}
