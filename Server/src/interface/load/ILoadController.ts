import { Response } from "express";
import { CustomeRequest } from "../../Middleware/userAuth";

export interface ILoadController {
    postLoad(req: CustomeRequest, res: Response): Promise<void>;
    fetchLoads(req: CustomeRequest, res: Response): Promise<void>;
    updateLoad(req: CustomeRequest, res: Response): Promise<void>;
    deleteLoad(req: CustomeRequest, res: Response): Promise<void>;
    loadsForAdmin(req: CustomeRequest, res: Response) : Promise<void>;
    loadsForTransporter(req: CustomeRequest, res: Response): Promise<void>;
}