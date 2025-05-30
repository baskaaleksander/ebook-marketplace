import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { ReviewOrderDto } from "./dtos/review-order.dto";

declare module 'express' {
    interface Request {
        user: {
            username: string;
            userId: string;
        }
    }
}

@Injectable()
export class ReviewService {
    constructor(private readonly prismaService: PrismaService) {}


    async getReviews(id: string) {
        const reviews = await this.prismaService.review.findMany({
            where: { productId: id },
            include: { buyer: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    surname: true,
                    avatarUrl: true,
                }
            } }
        });

        if(!reviews){
            throw new NotFoundException('No reviews found');
        }

        return reviews;
    }

    

    async getReview(reviewId: string) {
        const review = await this.prismaService.review.findUnique({
            where: { id: reviewId }
            });
        
        if(!review){
            throw new NotFoundException('Review not found');
        }

        return review;
    }

    async createReview(id: string, userId: string, data: ReviewOrderDto) {
        // const user = await this.prismaService.user.findUnique({
        //     where: { id: userId },
        //     include: { orders: true }
        // });

        // if(!user){
        //     throw new NotFoundException('User not found');
        // }

        // const ordersOfUser = user.orders;

        // const orderWithProduct = await this.prismaService.order.findFirst({
        //     where: {
        //         id: { in: ordersOfUser.map(order => order.id) },
        //         productId: id
        //     }
        // });

        // if(!orderWithProduct){
        //     throw new NotFoundException('Order not found for this product');
        // }

        // await this.prismaService.order.update({
        //     where: { id:  },
        //     data: { isReviewed: true }
        // })

        const order = await this.prismaService.order.findFirst({
            where: {id}
        });

        if(!order || !order.productId){
            throw new NotFoundException('Order not found');
        }

        if(order.buyerId !== userId){
            throw new UnauthorizedException('You are not the owner of this order');
        }

        await this.prismaService.order.update({
            where: { id: order.id },
            data: { isReviewed: true }
        });

        const review = await this.prismaService.review.create({
            data: {
                buyerId: userId,
                productId: order.productId,
                rating: data.rating,
                comment: data.comment
            }
        });
        
        return review;
    }
    async updateReview(reviewId: string, body: ReviewOrderDto, userId: string) {
        const review = await this.prismaService.review.findUnique({
            where: { id: reviewId }
        });

        if(!review){
            throw new NotFoundException('Review not found');
        }

        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            include: { orders: true }
        });

        if(!user){
            throw new NotFoundException('User not found');
        }

        if(review.buyerId !== user.id){
            throw new UnauthorizedException('You are not the owner of this review');
        }

        const updateData: any = { rating: body.rating };
        
        if (body.comment !== undefined) {
            updateData.comment = body.comment;
        }
        
        return this.prismaService.review.update({
            where: { id: reviewId },
            data: updateData
        });
    }

    async deleteReview(reviewId: string, userId: string) {
        const review = await this.prismaService.review.findUnique({
            where: { id: reviewId }
        });

        if(!review){
            throw new NotFoundException('Review not found');
        }


        if(review.buyerId !== userId){
            throw new UnauthorizedException('You are not the owner of this review');
        }

        return this.prismaService.review.delete({
            where: { id: reviewId }
        });
    }
}