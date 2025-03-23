import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class ReviewOrderDto {
    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number;
    @IsOptional()
    comment: string;
}