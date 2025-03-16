import { IsOptional, IsString } from "class-validator";

export class ReviewOrderDto {
    @IsString()
    rating: number;
    @IsOptional()
    comment: string;
}