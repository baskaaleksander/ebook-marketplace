import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ViewedListingsService } from '../listing/viewedListing.service';
import { PrismaService } from '../prisma.service';

@Module({
    imports: [],
    providers: [TasksService, ViewedListingsService, PrismaService],
    exports: [TasksService]
})
export class ScheduleModule {}
