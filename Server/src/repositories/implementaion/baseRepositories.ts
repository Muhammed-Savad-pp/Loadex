import { Model, Document } from "mongoose";

export interface IRepositories<T> {
    create(item: T): Promise<T>;
    findById(id: string): Promise<T | null>;
}

export class BaseRepositories <T extends Document > implements IRepositories<T>{

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
}