import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ListingService } from './listing.service';


@Controller('listing')
export class ListingController {
    constructor(private readonly listingService: ListingService){}
    @Get(':id')
    findListingById(@Param() data: { id: string }) {
        return data.id;
    }

    @Get()
    findAllListings() {
        return 'All listings';
    }

    @Get(':category')
    searchListings(@Param() data: { category: string }, @Query() query: any) {
        return 'Search listings';
    }

    @Get(':id/reviews')
    getReviews(@Param() data: { id: string }) {
        return 'Reviews for listing ' + data.id;
    }

    @Get(':id/reviews/:reviewId')
    getReview(@Param() data: { id: string, reviewId: string }) {
        return 'Review ' + data.reviewId + ' for listing ' + data.id;
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    createListing(@Body() body, @Req() req: Request) {
        this.listingService.createListing(body, req);
    }

    @Post(':id/reviews')
    createReview(@Param() data: { id: string }) {
        return 'Create review for listing ' + data.id;
    }

    @Put(':id')
    updateListing(@Param() data: { id: string }) {
        return 'Update listing ' + data.id;
    }

    @Put(':id/reviews/:reviewId')
    updateReview(@Param() data: { id: string, reviewId: string }) {
        return 'Update review ' + data.reviewId + ' for listing ' + data.id;
    }

    @Delete(':id')
    deleteListing(@Param() data: { id: string }) {
        return 'Delete listing ' + data.id;
    }

    
}
