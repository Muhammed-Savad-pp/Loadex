import { ILoad } from "../../models/LoadModel";
import { ILoadRepository } from "../interface/ILoadRepository";
import { BaseRepositories } from "./baseRepositories";
import Load from "../../models/LoadModel";
import { FilterQuery, SortOrder } from "mongoose";


class LoadRepository extends BaseRepositories<ILoad> implements ILoadRepository {

    constructor() {
        super(Load)
    }

    async createLoad(loadData: Partial<ILoad>): Promise<ILoad | null> {
        try {

            return await this.model.create(loadData);

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async getLoads(filter: FilterQuery<ILoad>, populateOptions: {path: string, select?: string}[], skip?: number, limit?: number, sort?: Record<string, SortOrder>): Promise<ILoad[] | null> {
        try {

            return await this.findWithPopulate(filter, populateOptions, skip, limit, sort);

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async findLoadById(loadId: string): Promise<ILoad | null> {
        try {

            return await this.model.findById(loadId)

        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error))
        }
    }

    async findLoadByIdAndUpdate(loadId: string, loadData: Partial<ILoad>): Promise<ILoad | null> {
        try {
            
            return await this.updateById(loadId, loadData);

        } catch (error) {
            throw new Error( error instanceof Error ? error.message : String(error))
        }
    }




}

export default new LoadRepository()