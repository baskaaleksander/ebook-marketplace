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
    imageUrl: string;
    views: number;
    fileUrl: string;
    sellerId: string;
    isFeatured: boolean;
    seller: UserData;
    reviews: Review[];
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

enum PayoutStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
 }

export type Payout = {
    id: string;
    userId: string;
    amount: number;
    stripePayoutId: string;
    status: PayoutStatus;
    createdAt: string;
    updatedAt: string;
}

export enum OrderStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
  }
  
export type Order = {
    id: string;
    sellerId: string;
    buyerId: string;
    productId: string;
    product: Product;
    refundId?: string | null;
    amount: number;
    status: OrderStatus;
    checkoutSessionId?: string | null;
    paymentUrl?: string | null;
    createdAt: string;
    updatedAt: string;
}

export type Balance = {
    "available" : {
        "amount" : number,
        "currency" : string
    },
    "pending" : {
        "amount" : number,
        "currency" : string
    }
}

export const mockUserData: UserData = {
    id: "1",
    name: "John",
    surname: "Doe",
    email: "",
    stripeStatus: "ACTIVE",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    avatarUrl: "https://example.com/avatar.jpg",
    rating: 4.5,
    createdAt: new Date().toISOString(),
}

export type Review = {
    id: string, 
    rating: number, 
    comment: string, 
    createdAt: string, 
    user: UserData 
}