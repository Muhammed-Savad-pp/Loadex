import { Request, Response, NextFunction, response } from "express";
import { CustomeRequest } from "../../Middleware/userAuth";
import { TransporterService } from "../../services/transporter/transporterService";
import { HTTP_STATUS } from "../../enums/httpStatus";
import { ITransporterService } from "../../interface/transporter/ITransporterService";
import { ITransporterController } from "../../interface/transporter/ITransporterController";


export class TransporterController implements ITransporterController{

    constructor(private transporterService: ITransporterService) {}

    async verificationStatus(req: CustomeRequest, res: Response): Promise<void> {
        try {
            console.log("req.user", req.user);
            
            const id = req.user?.id

            const response = await this.transporterService.verificationStatus(id)
            console.log('controller response', response);
            

            if(!response.success) {
                res.status(HTTP_STATUS.BAD_REQUEST).json(response);
                return;
            }
            
            res.status(HTTP_STATUS.OK).json(response)
            
        } catch (error) {
            console.log(error)
        }
    }

    async getProfileData (req: CustomeRequest, res: Response) : Promise<void> {
        try {
            
            const transporterId = req.user?.id

            const response = await this.transporterService.getProfileData(transporterId);

            if(!response.success) {
                res.status(HTTP_STATUS.BAD_REQUEST).json(response)
                return
            }

            res.status(HTTP_STATUS.OK).json(response)

            
        } catch (error) {
            console.log(error)
        }
    }

    async kycVerification (req: CustomeRequest, res: Response): Promise<void> {
        try {

            const userId = req.user?.id
            const {panNumber} = req.body;

            console.log(panNumber, 'panNumber');
            
            const aadhaarFront = ( req.files as any )?.aadhaarFront?.[0];
            const aadhaarBack = ( req.files as any )?.aadhaarBack?.[0];

            // console.log(aadhaarBack);
            // console.log(aadhaarFront);
            
            const response = await this.transporterService.kycVerification(userId, panNumber, aadhaarFront, aadhaarBack)

            if( !response ) {
                res.status(HTTP_STATUS.NOT_FOUND).json(response)
            } else {
                res.status(HTTP_STATUS.OK).json(response)
            }

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response)
        }
    }


    async registerTruck (req: CustomeRequest, res: Response): Promise<void> {
        try {

            const formDataToSend = req.body;
            const transporterId = req.user?.id

            const truckData = formDataToSend

            const rcBook = (req.files as any)?.rcBook?.[0]
            const driverLicense = (req.files as any)?.driverLicense?.[0];

            const response = await this.transporterService.registerTruck(transporterId, truckData, rcBook, driverLicense)

            if(response) {
                res.status(HTTP_STATUS.CREATED).json(response)
            } else {
                res.status(HTTP_STATUS.BAD_REQUEST).json(response)
            }
            
            

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response)
        }
    }

    
}

