import { response, Response } from "express";
import { IAdminController } from "../../interface/admin/IAdminController";
import { CustomeRequest } from "../../Middleware/userAuth";
import { IAdminService } from "../../interface/admin/IAdminService";
import { HTTP_STATUS } from "../../enums/httpStatus";


export class AdminController implements IAdminController {
    constructor(private _adminService: IAdminService) { }


    async login(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const { email, password } = req.body;

            const { accessToken, refreshToken, success, message } = await this._adminService.login(email, password);

            if( success ) {
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 3 * 24 * 60 * 1000,
                    sameSite: 'none'
                })
            }

          

            res.status(HTTP_STATUS.OK).json({
                success: success,
                message: message,
                token: accessToken,
                role: 'admin'
            })

        } catch (error: any) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message })
        }
    }

    async getTransporter(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const search = req.query.search as string;
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string)
            const response = await this._adminService.getTransporter(search, page, limit);
            // console.log('response', response)

            res.status(HTTP_STATUS.OK).json(response)
            
        } catch (error: any) {
            console.log(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message })
        }
    }

    async logout(req: CustomeRequest, res: Response): Promise<void> {

        try {

            res.clearCookie('refreshToken');
            res.json({message: 'Logout SuccessFully'});
            return
            
        } catch (error) {
            console.error(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: 'Logout Failed'})
        }
        
    }

    async updateTransporterBlockandUnblock(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const { id } = req.body;

            const response = await this._adminService.updateTransporterBlockandUnblock(id)

            res.status(HTTP_STATUS.OK).json(response)
            
        } catch (error) {
            console.log(error)
        }   
    }

    async getRequestedTransporters(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const transporters = await this._adminService.getRequestedTransporter();
            res.status(HTTP_STATUS.OK).json({
                transporters
            })

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response)
        }
    }

    async changeVerificationStatus(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const { id , status } = req.body
            const response = await this._adminService.changeVerificationStatus(id, status);

            res.status(HTTP_STATUS.OK).json(response);
            
            
        } catch (error: any) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: error.message})
        }
    }

    async getShipper(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const search = req.query.search as string;
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);

            const response = await this._adminService.getShipper(search, page, limit);
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error: any) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: error.message})
        }
    }

    async changeShipperStatus(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const {id} = req.body;
            
            const response = await this._adminService.changeShipperStatus(id);

            res.status(HTTP_STATUS.OK).json(response)

        } catch (error: any) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: error.message})
        }
    }

    async getRequestedShipper(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const response = await this._adminService.getRequestedShipper();             
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error: any) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: error.message})
        }
    }

    async changeShipperVerificationStatus(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const {id, status } = req.body;

            const response = await this._adminService.changeShipperVerificationStatus(id, status);
            res.status(HTTP_STATUS.OK).json(response)

            
        } catch (error: any) {
            console.log(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: error.message})
        }
    }

    async getRequestedTrucks(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const response = await this._adminService.getRequestedTrucks();
            
            res.status(HTTP_STATUS.OK).json(response);
            
        } catch (error: any) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:  error.message})
        }
    }

    async changeTruckVerificationStatus(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const {id, status} = req.body;
            console.log(id, status);

            const response = await this._adminService.changeTruckVerificationStatus(id, status);
            res.status(HTTP_STATUS.OK).json({response});

        } catch (error: any) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: error.message})
        }
    }

    async getLoads(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);
            
            const response = await this._adminService.getLoads(page, limit);
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error: any) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: error.message})
        }
    }

    async fetchDashboardDatas(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const response = await this._adminService.fetchDashboardDatas();
            res.status(HTTP_STATUS.OK).json(response)
            
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchTrips(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string)

            const response = await this._adminService.fetchTrips(page, limit);

            res.status(HTTP_STATUS.OK).json(response)
            
        } catch (error) {
            console.error(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async sendTripAmountToTransporter(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const { tripId } = req.body;
            console.log(tripId)
            const response = await this._adminService.sendTripAmountToTransporter(tripId)

            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchPaymentHistory(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const searchTerm = req.query.searchTerm as string;
            const paymentStatus = req.query.paymentStatus as string;
            const userType = req.query.userType as string;
            const paymentfor = req.query.paymentfor as string;
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);


            const response = await this._adminService.fetchPaymentHistory(searchTerm,paymentStatus, userType, paymentfor, page, limit);
            console.log(response, 'res');
            
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.OK).json(error)
        }
    }

}