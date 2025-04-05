export type UserData = {
    id: string;
    name: string;
    surname: string;
    email: string;
    stripeStatus: string;
    description?: string;
    avatarUrl?: string;
    rating: number;
    createdAt: string;
}

export type Product = {
    id: string;
    title: string;
    description: string;
    price: number;
    fileUrl: string;
    sellerId: string;
    isFeatured: boolean;
    seller: UserData;
    createdAt: string;
}

export type Category = {
    id: string;
    name: string;
    products: Product[];
}

export type Seller = {
    id: string;
    name: string;
    surname: string;
}