import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ViewedListingsService } from "../listing/viewedListing.service";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class TasksService {
    constructor(
        private viewedListingService: ViewedListingsService,
        private prismaService: PrismaService,
    ) {}

    @Cron('0 0 */30 * *')
    async handleCron() {
        await this.viewedListingService.clearViewedProducts();
    }

    @Cron('0 */6 * * *')
    async handleExpiredFeaturedListing(){
        const now = new Date();

        const result = await this.prismaService.product.updateMany({
            where: {
                isFeatured: true,
                featuredForTime: {
                    lte: now,
                },
                },
                data: {
                    isFeatured: false,
                    featuredForTime: null,
                }
            });

        console.log(`Updated ${result.count} featured listings to expired.`);
    }
}