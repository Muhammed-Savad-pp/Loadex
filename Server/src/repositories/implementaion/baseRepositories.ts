import { FilterQuery, QueryOptions } from "mongoose";
import { Model, Document, UpdateQuery } from "mongoose";
import { IBaseRepository } from "../interface/IBaseRepository";


export class BaseRepositories <T extends Document > implements IBaseRepository<T>{

    protected readonly model:Model<T>;

    constructor(model:Model<T>){
        this.model = model;
    }

    async create(item: T): Promise<T> {
        const newItem = new this.model(item);
        return await newItem.save()
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id).exec()
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
}

