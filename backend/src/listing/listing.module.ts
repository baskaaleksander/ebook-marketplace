import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { ReviewService } from './review.service';
import { FavouritesService } from './favourites.service';
import { ViewedListingsService } from './viewedListing.service';

@Module({
  providers: [ListingService, PrismaService, UserService, ReviewService, FavouritesService, ViewedListingsService],
  controllers: [ListingController],
  exports: [ListingService, ReviewService, FavouritesService, ViewedListingsService]
})
export class ListingModule {}
