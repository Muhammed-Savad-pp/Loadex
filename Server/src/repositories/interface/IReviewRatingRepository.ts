import { FilterQuery } from "mongoose";
import { IRatingReview } from "../../models/ReviewRatingModel";
import { IBaseRepository } from "./IBaseRepository";


export interface IReviewRatingRepository extends IBaseRepository<IRatingReview> {
    createReview(reviewData: Partial<IRatingReview>): Promise<IRatingReview>
    findWithPopulates(filter: FilterQuery<IRatingReview>, populateOptions: {path: string, select?: string}[]): Promise<IRatingReview[]>;
}