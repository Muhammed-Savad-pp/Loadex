import { Response } from "express";
import { CustomeRequest } from "../../Middleware/userAuth";

export interface IBidController {
    createBid(req: CustomeRequest, res: Response): Promise<void>;
    fetchBidsForTransporter(req: CustomeRequest, res: Response): Promise<void>;
    updateBid(req: CustomeRequest, res: Response): Promise<void>;
    deleteBidById(req: CustomeRequest, res: Response): Promise<void>;
    fetchBidsForShipper(req: CustomeRequest, res: Response): Promise<void>;
    updateBidStatusByShipper(req: CustomeRequest, res: Response): Promise<void>;
}