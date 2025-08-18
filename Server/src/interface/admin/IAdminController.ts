import { Response } from "express";
import { CustomeRequest } from "../../Middleware/userAuth";

export interface IAdminController {
    login(req: CustomeRequest, res: Response) : Promise<void>;
    getTransporter(req: CustomeRequest, res: Response) : Promise<void>;
    logout(req:CustomeRequest, res: Response) : Promise<void>;
    updateTransporterBlockandUnblock(req: CustomeRequest, res: Response) : Promise<void>;
    getRequestedTransporters(req: CustomeRequest, res: Response) : Promise<void>;
    changeVerificationStatus(req: CustomeRequest, res: Response) : Promise<void>;
    getShipper(req: CustomeRequest, res: Response): Promise<void>;
    changeShipperStatus(req: CustomeRequest, res: Response): Promise<void>;
    getRequestedShipper(req:CustomeRequest, res: Response) : Promise<void>;
    changeShipperVerificationStatus(req: CustomeRequest, res: Response): Promise<void>;
    fetchDashboardDatas(req: CustomeRequest, res: Response) : Promise<void>;
    fetchPaymentHistory(req: CustomeRequest, res: Response): Promise<void>;
    fetchRevenueDatas(req: CustomeRequest, res: Response): Promise<void>;
}