import { FilterQuery } from "mongoose";
import ReviewRating, { IRatingReview } from "../../models/ReviewRatingModel";
import { IReviewRatingRepository } from "../interface/IReviewRatingRepository";
import { BaseRepositories } from "./baseRepositories";

class ReviewRatingRepository extends BaseRepositories<IRatingReview> implements IReviewRatingRepository {

    constructor() {
        super(ReviewRating)
    }

    async createReview(reviewData: Partial<IRatingReview>): Promise<IRatingReview> {
        try {

            return await this.model.create(reviewData);

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async findWithPopulates(filter: FilterQuery<IRatingReview>, populateOptions: { path: string; select?: string; }[]): Promise<IRatingReview[]> {
        try {
            
            return await this.findWithPopulate(filter, populateOptions)

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

}

export default new ReviewRatingRepository()