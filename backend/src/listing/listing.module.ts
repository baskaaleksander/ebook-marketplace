import { Module } from '@nestjs/common';
import { ListingService } from './listing.service';
import { ListingController } from './listing.controller';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [ListingService, PrismaService, UserService],
  controllers: [ListingController]
})
export class ListingModule {}
