import { Document, UpdateQuery, QueryOptions, FilterQuery, PipelineStage, SortOrder } from "mongoose"


export interface IBaseRepository <T extends Document> {
    create(item: T): Promise<T>;
    findById(id: string): Promise<T | null>;
    updateById(id: string, data: UpdateQuery<T>, options?: QueryOptions) : Promise<T | null>;
    find(filter: FilterQuery<T>, projection?: Record<string, number>,  skip?: number, limit?: number, sort?: Record<string, SortOrder>) : Promise<T[]>
    follow(id: string, field: keyof T, value: any, options?: QueryOptions ): Promise<T | null>;
    unFollow(id: string, field: keyof T, value: any, options?: QueryOptions): Promise<T | null>;
    count(filter: FilterQuery<T>): Promise<number>
    aggregate<R = any>(pipeline: PipelineStage[]): Promise<R[]>
    findWithPopulate(filter: FilterQuery<T>, populateOptions: {path: string; select?: string}[], skip?: number, limit?: number, sort?: Record<string, SortOrder>): Promise<T[]> 
    deleteById(id: string): Promise<T | null>;
    findOne(filter: FilterQuery<T>, projection?: Record<string, number>): Promise<T | null>
}   