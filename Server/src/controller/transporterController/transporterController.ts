import { Request, Response, NextFunction, response } from "express";
import { CustomeRequest } from "../../Middleware/userAuth";
import { TransporterService } from "../../services/transporter/transporterService";
import { HTTP_STATUS } from "../../enums/httpStatus";
import { ITransporterService } from "../../interface/transporter/ITransporterService";
import { ITransporterController } from "../../interface/transporter/ITransporterController";


export class TransporterController implements ITransporterController{

    constructor(private _transporterService: ITransporterService) {}

    async verificationStatus(req: CustomeRequest, res: Response): Promise<void> {
        try {
            console.log("req.user", req.user);
            
            const id = req.user?.id

            const response = await this._transporterService.verificationStatus(id)
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

            const response = await this._transporterService.getProfileData(transporterId);

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
            
            const response = await this._transporterService.kycVerification(userId, panNumber, aadhaarFront, aadhaarBack)

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

            const truckData = {
                ...formDataToSend,
                currentLocationCoords: JSON.parse(formDataToSend.currentLocationCoords),
                fromCoords: JSON.parse(formDataToSend.fromCoords),
                toCoords: JSON.parse(formDataToSend.toCoords),
            };
    

            const rcBook = (req.files as any)?.rcBook?.[0]
            const driverLicense = (req.files as any)?.driverLicense?.[0];

            const response = await this._transporterService.registerTruck(transporterId, truckData, rcBook, driverLicense)

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

    async fetchLoads(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const respone = await this._transporterService.getLoads();

            res.status(HTTP_STATUS.OK).json(respone)

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response)
        }
    }

    async findTrucks(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const transporterId = req.user?.id;

            const response = await this._transporterService.findTrucks(transporterId);
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async updateTruckAvailable(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const formdata  = req.body;
            
            const currentLocationCordinates = req.body.currentLocationCordinates
            ? JSON.parse(req.body.currentLocationCordinates)
            : { latitude: 0, longitude: 0 };

            const driverLicensefile = ( req.files as any)?.driverLicenseFile?.[0]            
            
            const response = await this._transporterService.updateTruckAvailable(formdata, driverLicensefile );
            
            res.status(HTTP_STATUS.OK).json(response)
            

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async sendBid(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const formData = req.body;
            const transporterId = req.user?.id;

            const response = await this._transporterService.sendBid(formData, transporterId);
            
            res.status(HTTP_STATUS.CREATED).json(response)
            
        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }


    async fetchBids(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const transporterId = req.user?.id;

            const resposne = await this._transporterService.fetchAllBids(transporterId);

            res.status(HTTP_STATUS.OK).json(resposne)

        } catch (error) {
            console.log(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async bidCheckoutSession(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const {bidId} = req.body;

            console.log(bidId, 'bidID');

            const response = await this._transporterService.bidCheckoutSession(bidId);

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async verifyBidPayment(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const {transactionId, status } = req.body;
            console.log(transactionId, status)

            const response = await this._transporterService.verifyBidPayment(transactionId, status);

            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchTrips(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const transporterId = req.user?.id;
            
            const response = await this._transporterService.fetchTrips(transporterId);

            res.status(HTTP_STATUS.OK).json(response)


        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async updateTripStatus(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const { tripId, newStatus} = req.body;

            
            const response = await this._transporterService.updateTripStatus(tripId, newStatus);

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async updateProfile(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const transporterId = req.user?.id;
            const formData = req.body;
            const {name, phone } = formData;

            const profileImage = (req.files as any)?.profileImage?.[0]
        
            const response = await this._transporterService.updateProfile(transporterId, name, phone, profileImage);

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }   
    }

    async fetchShipperProfileData(req: CustomeRequest, res: Response): Promise<void> {
        try {
    
            const transporterId = req.user?.id;
            const { shipperId }  = req.params;

            const response = await this._transporterService.fetchShipperProfileData(transporterId, shipperId);

            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async followShipper(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const { shipperId } = req.body;
            const transporterId = req.user?.id;

            const response = await this._transporterService.followShipper(transporterId, shipperId);

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async unfollowShipper(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const tranpsorterId = req.user?.id;
            const { shipperId } = req.body;

            const response = await this._transporterService.unFollowShipper(tranpsorterId, shipperId);

            res.status(HTTP_STATUS.OK).json(response);
            
        } catch (error) {
            console.error(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async postReview(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const transporterId = req.user?.id;
            const { shipperId, rating, comment } = req.body;

            const response = await this._transporterService.postReviews(transporterId, shipperId, rating, comment);

            res.status(HTTP_STATUS.OK).json(response);
            
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchShippers(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const response = await this._transporterService.fetchShippers();
            res.status(HTTP_STATUS.OK).json(response)            

        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }
     
}

