import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class FilterQueryDto {
    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    authorId?: string;

    @IsOptional()
    @IsEnum(['price', 'createdAt', 'popularity'])
    sortBy?: 'price' | 'createdAt' | 'popularity';

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortDirection?: 'asc' | 'desc';

    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number;
}
