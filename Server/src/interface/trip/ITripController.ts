import { Response } from "express";
import { CustomeRequest } from "../../Middleware/userAuth";

export interface ITripController {
    fetchTripsForTransporter(req: CustomeRequest, res: Response): Promise<void>;
    updateTripStatus(req: CustomeRequest, res: Response): Promise<void>;
    fetchTripsForShipper(req: CustomeRequest, res: Response): Promise<void>;
    fetchTripsForAdmin(req: CustomeRequest, res: Response): Promise<void>;
    sendTripAmountToTransporter(req: CustomeRequest, res: Response): Promise<void>;

}