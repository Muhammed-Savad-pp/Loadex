import { ILoad } from "../../models/LoadModel";
import { IBaseRepository } from "./IBaseRepository";
import { FilterQuery, SortOrder } from "mongoose";

export interface ILoadRepository extends IBaseRepository<ILoad> {
    createLoad(loadData: Partial<ILoad>) : Promise<ILoad | null>;
    getLoads( filter: FilterQuery<ILoad>, populateOptions: {path: string, select?: string}[], skip?: number, limit?: number, sort?: Record<string, SortOrder>): Promise<ILoad[] | null>;
    findLoadById(loadId: string): Promise<ILoad | null>;
    findLoadByIdAndUpdate(loadId: string, loadData: Partial<ILoad>): Promise<ILoad | null>
    
}