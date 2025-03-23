import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ViewedListingsService } from "../listing/viewedListing.service";

@Injectable()
export class TasksService {
    constructor(
        private viewedListingService: ViewedListingsService,
    ) {}

    @Cron('0 0 */30 * *')
    async handleCron() {
        await this.viewedListingService.clearViewedProducts();
    }
}