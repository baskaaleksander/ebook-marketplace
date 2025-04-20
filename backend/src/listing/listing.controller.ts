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
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse, 
  ApiTags, 
  ApiParam, 
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';

@ApiTags('Listings')
@Controller('listing')
export class ListingController {
    constructor(
        private listingService: ListingService, 
        private reviewService: ReviewService,
        private favouritesService: FavouritesService,
        private viewedListingsService: ViewedListingsService,
        private analyticsService: AnalyticsService
    ){}

    @ApiOperation({ summary: 'Find all listings with optional filters' })
    @ApiQuery({ name: 'query', required: false, description: 'Search term to filter listings' })
    @ApiQuery({ name: 'category', required: false, description: 'Category filter' })
    @ApiQuery({ name: 'minPrice', required: false, description: 'Minimum price filter' })
    @ApiQuery({ name: 'maxPrice', required: false, description: 'Maximum price filter' })
    @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
    @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort direction (asc/desc)' })
    @ApiResponse({ status: 200, description: 'List of products matching criteria' })
    @UseGuards(OptionalAuthGuard)
    @Get()
    findListings(@Query() filters: SearchQueryDto, @CurrentUser('userId') userId?: string) {
        return this.listingService.findListings(filters, userId);
    }
    
    @ApiOperation({ summary: 'Create a new listing' })
    @ApiBody({ type: CreateListingDto })
    @ApiResponse({ status: 201, description: 'Listing successfully created' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt')) 
    @Post()
    createListing(@Body() body: CreateListingDto, @CurrentUser('userId') userId: string) {
        return this.listingService.createListing(body, userId);
    }

    @ApiOperation({ summary: 'Get user analytics data' })
    @ApiResponse({ status: 200, description: 'Analytics data retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Get('analytics')
    getAnalytics(@CurrentUser('userId') userId: string) {
        return this.analyticsService.getUserAnalytics(userId);
    }

    @ApiOperation({ summary: 'Get featured listings' })
    @ApiResponse({ status: 200, description: 'Featured listings retrieved successfully' })
    @UseGuards(OptionalAuthGuard)
    @Get('featured')
    findFeaturedListings(@CurrentUser('userId') userId?: string) {
        return this.listingService.getFeaturedListings(userId);
    }
    
    @ApiOperation({ summary: 'Get all categories with sample products' })
    @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
    @UseGuards(OptionalAuthGuard)
    @Get('categories')
    getCategories(@CurrentUser('userId') userId?: string) {
        return this.listingService.getCategories(userId);
    }
    
    @ApiOperation({ summary: 'Get user favorites' })
    @ApiResponse({ status: 200, description: 'User favorites retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Get('favourites') 
    getFavorites(@CurrentUser('userId') userId: string) {
        return this.favouritesService.getFavorites(userId);
    }
    
    @ApiOperation({ summary: 'Get user viewed products history' })
    @ApiResponse({ status: 200, description: 'Viewed products retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Get('viewed')
    getViewedProducts(@CurrentUser('userId') userId: string) {
        return this.viewedListingsService.getViewedProducts(userId);
    }
    
    @ApiOperation({ summary: 'Get listings by user ID' })
    @ApiParam({ name: 'userId', description: 'User ID to fetch listings for' })
    @ApiResponse({ status: 200, description: 'User listings retrieved successfully' })
    @UseGuards(OptionalAuthGuard)
    @Get('user/:userId')
    findUserListings(@Param('userId') userId: string, @CurrentUser('userId') currentUserId?: string) {
        return this.listingService.findUserListings(userId, currentUserId);
    }
    
    @ApiOperation({ summary: 'Add a listing to favorites' })
    @ApiParam({ name: 'id', description: 'Listing ID to add to favorites' })
    @ApiResponse({ status: 201, description: 'Listing added to favorites successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Post('favourites/:id')
    addFavorite(@Param('id') param: string, @CurrentUser('userId') userId: string) {
        return this.favouritesService.addFavorite(userId, param);
    }
    
    @ApiOperation({ summary: 'Remove a listing from favorites' })
    @ApiParam({ name: 'id', description: 'Listing ID to remove from favorites' })
    @ApiResponse({ status: 200, description: 'Listing removed from favorites successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Delete('favourites/:id')
    removeFavorite(@Param('id') param: string, @CurrentUser('userId') userId: string) {
        return this.favouritesService.removeFavorite(userId, param);
    }
    
    @ApiOperation({ summary: 'Get a specific review' })
    @ApiParam({ name: 'reviewId', description: 'Review ID to fetch' })
    @ApiResponse({ status: 200, description: 'Review retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    @Get('reviews/:reviewId')
    getReview(@Param('reviewId') reviewId: string) {
        return this.reviewService.getReview(reviewId);
    }
    
    @ApiOperation({ summary: 'Update a review' })
    @ApiParam({ name: 'reviewId', description: 'Review ID to update' })
    @ApiBody({ type: ReviewOrderDto })
    @ApiResponse({ status: 200, description: 'Review updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Put('reviews/:reviewId')
    updateReview(@Param('reviewId') param: string, @Body() body: ReviewOrderDto, @CurrentUser('userId') userId: string) {
        return this.reviewService.updateReview(param, body, userId);
    }
    
    @ApiOperation({ summary: 'Delete a review' })
    @ApiParam({ name: 'reviewId', description: 'Review ID to delete' })
    @ApiResponse({ status: 200, description: 'Review deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Delete('reviews/:reviewId')
    deleteReview(@Param('reviewId') param: string, @CurrentUser('userId') userId: string) {
        return this.reviewService.deleteReview(param, userId);
    }
    
    @ApiOperation({ summary: 'Get a listing by ID' })
    @ApiParam({ name: 'id', description: 'Listing ID to fetch' })
    @ApiResponse({ status: 200, description: 'Listing retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    @UseGuards(OptionalAuthGuard)
    @Get(':id')
    findListingById(@Param('id') param: string, @CurrentUser('userId') userId?: string) {
        return this.listingService.findListingById(param, userId);
    }
    
    @ApiOperation({ summary: 'Update a listing' })
    @ApiParam({ name: 'id', description: 'Listing ID to update' })
    @ApiBody({ type: UpdateListingDto })
    @ApiResponse({ status: 200, description: 'Listing updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    updateListing(@Param('id') param: string, @Body() updateListingDto: UpdateListingDto, @CurrentUser('userId') userId: string) {
        return this.listingService.updateListing(param, updateListingDto, userId);
    }
    
    @ApiOperation({ summary: 'Delete a listing' })
    @ApiParam({ name: 'id', description: 'Listing ID to delete' })
    @ApiResponse({ status: 200, description: 'Listing deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    deleteListing(@Param('id') param: string, @CurrentUser('userId') userId: string) {
        return this.listingService.deleteListing(param, userId);
    }
    
    @ApiOperation({ summary: 'Get view count for a listing' })
    @ApiParam({ name: 'id', description: 'Listing ID to get views for' })
    @ApiResponse({ status: 200, description: 'View count retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    @Get(':id/views')
    getProductViews(@Param('id') param: string) {
        return this.viewedListingsService.getProductViews(param);
    }
    
    @ApiOperation({ summary: 'Get reviews for a listing' })
    @ApiParam({ name: 'id', description: 'Listing ID to get reviews for' })
    @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    @Get(':id/reviews')
    getReviews(@Param('id') param: string) {
        return this.reviewService.getReviews(param);
    }
    
    @ApiOperation({ summary: 'Create a review for a listing' })
    @ApiParam({ name: 'id', description: 'Listing ID to review' })
    @ApiBody({ type: ReviewOrderDto })
    @ApiResponse({ status: 201, description: 'Review created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Post(':id/reviews')
    createReview(@Param('id') param: string, @CurrentUser('userId') userId: string, @Body() data: ReviewOrderDto) {
        return this.reviewService.createReview(param, userId, data);
    }
    
    @ApiOperation({ summary: 'Track a view for a listing' })
    @ApiParam({ name: 'id', description: 'Listing ID to track view for' })
    @ApiResponse({ status: 200, description: 'View tracked successfully' })
    @ApiResponse({ status: 404, description: 'Listing not found' })
    @Post(':id/view')
    trackListingView(@Param('id') param: string, @Req() req: Request) {
        const userId = req.user?.userId || null;
        return this.viewedListingsService.trackListingView(userId, param);
    }
}
