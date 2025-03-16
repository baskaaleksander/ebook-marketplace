import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dtos/create-listing.dto';
import { UpdateListingDto } from './dtos/update-listing.dto';
import { ReviewService } from './review.service';


@Controller('listing')
export class ListingController {
    constructor(private readonly listingService: ListingService, private readonly reviewService: ReviewService){}
    @Get(':id')
    findListingById(@Param() param: {id: string}) {
        return this.listingService.findListingById(param.id);
    }

    @Get()
    findAllListings() {
        return this.listingService.findAllListings();
    }

    @Get(':category')
    searchListings(@Param() param: {category: string} , @Query() query: {take: number}) {
        return this.listingService.searchListingsFromCategory(param.category, query.take);
    }

    @Get(':id/reviews')
    getReviews(@Param() param: {id: string} ) {
        return this.reviewService.getReviews(param.id);
    }

    @Get(':id/reviews/:reviewId')
    getReview(@Param() data: { id: string, reviewId: string }) {
        return 'Review ' + data.reviewId + ' for listing ' + data.id;
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    createListing(@Body() body: CreateListingDto, @Req() req: Request) {
        return this.listingService.createListing(body, req);
    }

    @Post(':id/reviews')
    createReview(@Param() param: { id: string }) {
        return 'Create review for listing ' + param.id;
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    updateListing(@Param() param: { id: string }, @Body() updateListingDto: UpdateListingDto, @Req() req: Request) {
        return this.listingService.updateListing(param.id, updateListingDto, req);
    }

    @Put('reviews/:reviewId')
    updateReview(@Param() data: { id: string, reviewId: string }, @Body() body: any) {
        return 'Update review ' + data.reviewId + ' for listing ' + data.id;
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    deleteListing(@Param()param: { id: string }, @Body() updateListingDto: UpdateListingDto, @Req() req: Request) {
        return this.listingService.deleteListing(param.id, req);
    }

    
}
