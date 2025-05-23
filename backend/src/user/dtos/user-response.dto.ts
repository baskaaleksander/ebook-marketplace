import { Expose } from "class-transformer";

export class UserResponseDto {

    @Expose()
    id: string;
    @Expose()
    email: string;
    @Expose()
    name: string;
    @Expose()
    surname: string;
    @Expose()
    avatarUrl?: string;
    @Expose()
    description?: string;
    @Expose()
    stripeStatus: string;
    @Expose()
    createdAt: Date;
    @Expose()
    products: any[];
    @Expose()
    reviews: any[];
    @Expose()
    orders: any[];
    @Expose()
    payouts: any[];
}