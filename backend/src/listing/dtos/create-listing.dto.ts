import { IsArray, IsNumber, IsString, Min } from "class-validator";

export class CreateListingDto {
    @IsString()
    title: string;
    @IsString()
    description: string;
    @IsNumber()
    @Min(0)
    price: number;
    @IsString()
    fileUrl: string;
    @IsString()
    imageUrl: string;
    @IsArray()
    categories: {
        name: string;
    }[];
}