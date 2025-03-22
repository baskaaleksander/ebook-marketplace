import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ViewedListingsService } from 'src/listing/viewedListing.service';

@Module({
    providers: [TasksService, ViewedListingsService],
    exports: [TasksService]
})
export class ScheduleModule {}
