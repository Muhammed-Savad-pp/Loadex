import { Response } from "express";
import { CustomeRequest } from "../../Middleware/userAuth";


export interface ITruckController {
    findTrucks(req: CustomeRequest, res: Response): Promise<void>;
    registerTruck (req: CustomeRequest, res: Response): Promise<void>;
    updateTruckAvailable(req: CustomeRequest, res: Response): Promise<void>;
    fetchActiveTruck(req: CustomeRequest, res: Response): Promise<void>;
    updateTruck(req: CustomeRequest, res: Response): Promise<void>
    fetchTrucksForShipper(req: CustomeRequest, res: Response): Promise<void>;
    getRequestedTrucksForAdmin(req: CustomeRequest, res: Response) : Promise<void>;
    changeTruckVerificationStatusByAdmin(req: CustomeRequest, res: Response): Promise<void>;

}