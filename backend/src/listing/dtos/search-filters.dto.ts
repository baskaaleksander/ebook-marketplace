import { IsOptional, IsString, IsNumber, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class SearchFiltersDto {
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