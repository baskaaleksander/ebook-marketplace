import { Type } from "class-transformer";
import { IsOptional } from "class-validator";

export class SearchQueryDto {

    @IsOptional()
    search?: string;

    @IsOptional()
    @Type(() => Number)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    limit?: number;

    @IsOptional()
    sortBy?: string;

    @IsOptional()
    sortOrder?: string;

    
}