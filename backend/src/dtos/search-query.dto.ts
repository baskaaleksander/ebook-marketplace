import { Transform, Type } from "class-transformer";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";

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
      @IsString()
      query?: string;
    
      @IsOptional()
      @IsString()
      category?: string;
    
      @IsOptional()
      @Type(() => Number)
      @IsNumber()
      minPrice?: number;
    
      @IsOptional()
      @Type(() => Number)
      @IsNumber()
      maxPrice?: number;
    
      @IsOptional()
      @IsEnum(['title', 'price', 'createdAt', 'rating', 'views'])
      sortBy?: 'title' | 'price' | 'createdAt' | 'rating' | 'views' = 'createdAt';
    
      @IsOptional()
      @IsEnum(['asc', 'desc'])
      sortOrder?: 'asc' | 'desc' = 'desc';
    
      @IsOptional()
      @Transform(({ value }) => value === 'true')
      @IsBoolean()
      isFeatured?: boolean;
}