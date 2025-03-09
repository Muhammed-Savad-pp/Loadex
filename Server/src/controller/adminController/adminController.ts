import { response, Response } from "express";
import { IAdminController } from "../../interface/admin/IAdminController";
import { CustomeRequest } from "../../Middleware/userAuth";
import { IAdminService } from "../../interface/admin/IAdminService";
import { HTTP_STATUS } from "../../enums/httpStatus";
import { Token } from "aws-sdk";


export class AdminController implements IAdminController {
    constructor(private adminService: IAdminService) { }


    async login(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const { email, password } = req.body;

            const { accessToken, refreshToken } = await this.adminService.login(email, password);

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 3 * 24 * 60 * 1000,
                sameSite: 'none'
            })

            res.status(HTTP_STATUS.OK).json({
                success: true,
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

            const response = await this.adminService.getTransporter();
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

            const response = await this.adminService.updateTransporterBlockandUnblock(id)

            res.status(HTTP_STATUS.OK).json(response)
            
        } catch (error) {
            console.log(error)
        }   
    }

    async getRequestedTransporters(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const transporters = await this.adminService.getRequestedTransporter();
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
            const response = await this.adminService.changeVerificationStatus(id, status);

            res.status(HTTP_STATUS.OK).json(response);
            
            
        } catch (error: any) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: error.message})
        }
    }

    async getShipper(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const response = await this.adminService.getShipper();
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error: any) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: error.message})
        }
    }

    async changeShipperStatus(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const {id} = req.body;
            
            const response = await this.adminService.changeShipperStatus(id);

            res.status(HTTP_STATUS.OK).json(response)

        } catch (error: any) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: error.message})
        }
    }

    async getRequestedShipper(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const response = await this.adminService.getRequestedShipper();             
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error: any) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: error.message})
        }
    }

    async changeShipperVerificationStatus(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const {id, status } = req.body;
            console.log(id, status)

            const response = await this.adminService.changeShipperVerificationStatus(id, status);
            res.status(HTTP_STATUS.OK).json(response)

            
        } catch (error: any) {
            console.log(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: error.message})
        }
    }





}