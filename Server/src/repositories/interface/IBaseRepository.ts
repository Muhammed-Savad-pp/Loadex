import { Document, UpdateQuery, QueryOptions, FilterQuery, PipelineStage } from "mongoose"


export interface IBaseRepository <T extends Document> {
    create(item: T): Promise<T>;
    findById(id: string): Promise<T | null>;
    updateById(id: string, data: UpdateQuery<T>, options?: QueryOptions) : Promise<T | null>;
    find(filter: FilterQuery<T>, projection?: Record<string, number>) : Promise<T[]>
    follow(id: string, field: keyof T, value: any, options?: QueryOptions ): Promise<T | null>;
    unFollow(id: string, field: keyof T, value: any, options?: QueryOptions): Promise<T | null>;
    count(filter: FilterQuery<T>): Promise<number>
    aggregate<R = any>(pipeline: PipelineStage[]): Promise<R[]>
    findWithPopulate(filter: FilterQuery<T>, populateOptions: {path: string; select?: string}[]): Promise<T[]> 
}