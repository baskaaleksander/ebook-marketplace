import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class FilterQueryDto {

    @IsString()
    @IsOptional()
    category: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    minPrice: number;

    @IsNumber()
    @IsOptional()
    maxPrice: number;

    @IsNumber()
    @IsOptional()
    @Min(1)
    limit: number;

    @IsString()
    @IsOptional()
    search: string;

    @IsString()
    @IsOptional()
    authorId: string;


    @IsString()
    @IsOptional()
    sortBy: 'price' | 'date' | 'popularity';

    @IsString()
    @IsOptional()
    sortDirection: 'asc' | 'desc';

    @IsNumber()
    @IsOptional()
    @Min(1)
    page: number;

}