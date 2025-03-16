import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dtos/create-listing.dto';
import { UpdateListingDto } from './dtos/update-listing.dto';


@Controller('listing')
export class ListingController {
    constructor(private readonly listingService: ListingService){}
    @Get(':id')
    findListingById(@Param() id: string) {
        return this.listingService.findListingById(id);
    }

    @Get()
    findAllListings() {
        return this.listingService.findAllListings();
    }

    @Get(':category')
    searchListings(@Param() category: string , @Query() take: number) {
        return this.listingService.searchListingsFromCategory(category, take);
    }

    @Get(':id/reviews')
    getReviews(@Param() id: string ) {
        return 'Reviews for listing ' + id;
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
    createReview(@Param() id: string ) {
        return 'Create review for listing ' + id;
    }

    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    updateListing(@Param() id: string, @Body() updateListingDto: UpdateListingDto, @Req() req: Request) {
        return this.listingService.updateListing(id, updateListingDto, req);
    }

    @Put('reviews/:reviewId')
    updateReview(@Param() data: { id: string, reviewId: string }, @Body() body: any) {
        return 'Update review ' + data.reviewId + ' for listing ' + data.id;
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    deleteListing(@Param() id: string, @Body() updateListingDto: UpdateListingDto, @Req() req: Request) {
        return this.listingService.deleteListing(id, req);
    }

    
}
