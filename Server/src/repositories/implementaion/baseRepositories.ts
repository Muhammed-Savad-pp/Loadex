import { FilterQuery, PipelineStage, QueryOptions } from "mongoose";
import { Model, Document, UpdateQuery } from "mongoose";
import { IBaseRepository } from "../interface/IBaseRepository";


export class BaseRepositories <T extends Document > implements IBaseRepository<T>{

    protected readonly model:Model<T>;

    constructor(model:Model<T>){
        this.model = model;
    }

    async create(item: T): Promise<T> {
        try {
            
            const newItem = new this.model(item);
            return await newItem.save()

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
       
    }

    async findById(id: string): Promise<T | null> {
        try {

            return await this.model.findById(id).exec()
            
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
        
    }

    async updateById(id: string, data: UpdateQuery<T>, options: QueryOptions = {}) : Promise<T | null> {
        try {
            
            return await this.model.findByIdAndUpdate(id, data, {...options, new: true})

        } catch (error) {
            throw new Error(`UpdateById failed: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async find(filter: FilterQuery<T>, projection?: Record<string, number>): Promise<T[]> {
        try {

            return await this.model.find(filter, projection);
            
        } catch (error) {
            throw new Error(`find failed: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async findWithPopulate(filter: FilterQuery<T>, populateOptions: {path: string; select?: string}[]): Promise<T[]> {
        try {
            
            let query = this.model.find(filter);
            populateOptions.forEach(option => {
                query = query.populate(option);
            });

            return await query.exec();

        } catch (error) {
            throw new Error(`findWithPopulate failed: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async follow(id: string, field: keyof T, value: any, options: QueryOptions = { new: true }): Promise<T | null> {
        try {
            
            return await this.model.findByIdAndUpdate(
                id,
                { $addToSet : {[field]: value}} as UpdateQuery<T>,
                options
            )

        } catch (error) {
            throw new Error ( error instanceof Error ? error.message : String(error))
        }
    }

    async unFollow(id: string, field: keyof T, value: any, options: QueryOptions = { new: true}): Promise<T | null> {
        try {
            
            return await this.model.findByIdAndUpdate(
                id,
                { $pull : {[field]: value }} as UpdateQuery<T>,
                options
            )

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async count(filter: FilterQuery<T>): Promise<number> {
        try {
            
            return await this.model.countDocuments(filter);

        } catch (error) {
            throw new Error( error instanceof Error ? error.message : String(error))
        }
    }

    async aggregate<R = any>(pipeline: PipelineStage[]): Promise<R[]> {
        try {
            
            return await this.model.aggregate(pipeline);

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }
}

