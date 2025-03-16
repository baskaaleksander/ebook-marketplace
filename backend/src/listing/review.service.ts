import { Injectable } from "@nestjs/common";

@Injectable()
export class ReviewService {

    getReviews(id: string) {
        return `Reviews for listing ${id}`;
    }

    getReview(id: string, reviewId: string) {
        return `Review ${reviewId} for listing ${id}`;
    }

    createReview(id: string) {
        return `Create review for listing ${id}`;
    }
    updateReview(id: string, reviewId: string, body: any) {
        return `Update review ${reviewId} for listing ${id}`;
    }
    deleteReview(reviewId: string) {
        return `Delete review ${reviewId} for listing`;
    }
}