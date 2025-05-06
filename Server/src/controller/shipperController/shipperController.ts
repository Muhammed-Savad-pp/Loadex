import { Request, Response } from "express";
import { ShipperService } from "../../services/shipper/shipperService";
import { HTTP_STATUS } from "../../enums/httpStatus";
import { IShipperService } from "../../interface/shipper/IShipperService";
import { IShipperController } from "../../interface/shipper/IShipperController";
import { CustomeRequest } from "../../Middleware/userAuth";
import { message } from "aws-sdk/clients/sns";
import { constants } from "node:crypto";
import { stat } from "node:fs";

// const shipperService = new ShipperService();

class ShipperController implements IShipperController {

    constructor(private _shipperService: IShipperService) { }

    async SignUp(req: Request, res: Response) {
        try {

            const { name, email, phone, password, confirmPassword } = req.body;

            const response = await this._shipperService.shipperSignUp(
                name, email, phone, password, confirmPassword
            )

            if (!response.success) {

                res.status(HTTP_STATUS.BAD_REQUEST).json(response)

            } else {

                res.status(HTTP_STATUS.CREATED).json(response)

            }

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' })
        }
    }

    async verifyOtp(req: Request, res: Response) {
        try {

            const otp = req.body;

            const response = await this._shipperService.verifyShipperOtp(otp)

            if (typeof response === 'string') {

                res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response)
                return

            } else if (response?.success) {

                res.status(HTTP_STATUS.CREATED).json(response);
                return

            } else {
                res.status(HTTP_STATUS.BAD_REQUEST).json(response)
            }

        } catch (error) {
            console.log(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: 'OTP verification failed' })
        }
    }

    async resendOtp(req: Request, res: Response) {
        const email = req.body;
        try {

            const response = await this._shipperService.resendOtp(email)

            if (typeof response == 'string') {

                res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response)
            }

            if (response.success) {
                res.status(HTTP_STATUS.CREATED).json(response)
            }


        } catch (error) {
            console.log(error);

        }
    }

    async signIn(req: Request, res: Response) {

        const formData = req.body;

        try {

            const response = await this._shipperService.shipperLogin(formData);

            if (response.success) {
                res.status(HTTP_STATUS.CREATED)
                    .cookie('refreshToken', response.refreshToken,
                        {
                            httpOnly: true,
                            secure: true,
                            sameSite: 'none',
                            maxAge: 7 * 24 * 60 * 1000
                        }
                    )
                    .json({ success: true, message: "Logged in successFully", accessToken: response.accessToken, role: "shipper", data: response.data });
            } else {
                res.status(HTTP_STATUS.BAD_REQUEST).json(response)
            }


        } catch (error) {
            console.log(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Internal Server error" })
        }
    }

    async GoogleLogin(req: Request, res: Response): Promise<void> {
        try {

            const { name, email } = req.body;
            console.log(name, email);

            const response = await this._shipperService.shipperGoogleLoging(name, email);

            if (response.success) {
                res.status(HTTP_STATUS.CREATED)
                    .cookie('refreshToken', response.refreshToken,
                        {
                            httpOnly: true,
                            secure: true,
                            sameSite: 'none',
                            maxAge: 7 * 24 * 60 * 1000
                        }
                    )
                    .json({ success: true, message: "Logged in successFully", accessToken: response.accessToken, role: "shipper", data: response.data });
            } else {
                res.status(HTTP_STATUS.BAD_REQUEST).json(response)
            }

        } catch (error) {
            console.log(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async Logout(req: Request, res: Response) {
        try {

            res.clearCookie('refreshToken');
            res.json({ message: 'Logout Successfully' });
            return;

        } catch (error) {
            console.log('error in controller', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getProfileData(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const id = req.user?.id
            console.log('id in profile', id);


            const response = await this._shipperService.getShipperProfileData(id);

            if (!response.success) {
                res.status(HTTP_STATUS.NOT_FOUND).json(response);
                return
            }

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.error('error in getProfileData in controller', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async registerKyc(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const { companyName, panNumber, gstNumber } = req.body;
            const shipperId = req.user?.id;

            const aadhaarFront = (req.files as any)?.aadhaarFront?.[0];
            const aadhaarBack = (req.files as any)?.aadhaarBack?.[0];

            const response = await this._shipperService.registerKyc(shipperId, companyName, panNumber, gstNumber, aadhaarFront, aadhaarBack);
            console.log(response);

            if (!response.success) {
                res.status(HTTP_STATUS.NOT_FOUND).json(response)
            }

            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.error('error in registerKyc in controller', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async postLoad(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const shipperId = req.user?.id;
            const formData = req.body.formData;

            console.log(formData)


            const response = await this._shipperService.createLoad(shipperId, formData);

            if (response.success) {
                res.status(HTTP_STATUS.CREATED).json(response)
            } else {
                res.status(HTTP_STATUS.BAD_REQUEST).json(response)
            }



        } catch (error: any) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getVerificationstatus(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const id = req.user?.id;
            console.log(id);

            const response = await this._shipperService.getVerificationStatus(id);

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error: any) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message })
        }
    }

    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {

            const { email } = req.body;
            const response = await this._shipperService.forgotPassword(email);

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error: any) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message })
        }
    }

    async changePassword(req: Request, res: Response): Promise<void> {
        try {

            const { email, password } = req.body;
            console.log(email, password);


            const response = await this._shipperService.setNewPassword(email, password);
            console.log(response);


            res.status(HTTP_STATUS.OK).json(response)

        } catch (error: any) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message })
        }
    }

    async fetchBids(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const shipperId = req.user?.id;

            const response = await this._shipperService.findBids(shipperId);

            res.status(HTTP_STATUS.OK).json(response);


        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async updateBidStatus(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const { bidId, status } = req.body;
            console.log(bidId, status);

            const response = await this._shipperService.updateBidStatus(bidId, status);
            res.status(HTTP_STATUS.OK).json(response)


        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchLoads(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const shipperId = req.user?.id;
            const response = await this._shipperService.getShipperLoads(shipperId);

            res.status(HTTP_STATUS.OK).json(response)


        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async checkoutSession(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const { bidId } = req.body;

            const response = await this._shipperService.sessionCheckout(bidId);

            res.status(HTTP_STATUS.OK).json(response)


        } catch (error) {
            console.log(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async verifyPayment(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const shipperId = req.user?.id;
            const {sessionId, status} = req.body;
            
            const response = await this._shipperService.verifyPayment(sessionId, status)

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchTrips(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const shipperId = req.user?.id;            
            const response = await this._shipperService.fetchTrips(shipperId);

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async updateProfile(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const shipperId = req.user?.id;
            const  formData  = req.body;
            const {name, phone } = formData;

            console.log(formData, 'FormData');
            const profileImage = (req.files as any)?.profileImage?.[0];
            console.log(profileImage);
            

            const response = await this._shipperService.updateProfile(shipperId, name, phone, profileImage);

            res.status(HTTP_STATUS.OK).json(response);
            

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchTransporterDetails(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const shipperId = req.user?.id;
            const { transporterId } = req.params;

            const response = await this._shipperService.fetchTransporterDetails(shipperId, transporterId);

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async followTransporter(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const shipperId = req.user?.id;
            const { transporterId } = req.body;

            const response = await this._shipperService.followTransporter(shipperId, transporterId);
            
            res.status(HTTP_STATUS.OK).json(response);
            
        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async unFollowTransporter(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const shipperId = req.user?.id;
            const { transporterId } = req.body;

            const response = await this._shipperService.unFollowTransporter(shipperId, transporterId);

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async postReview(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const shipperId = req.user?.id;
            const { transporterId, rating, comment } = req.body;

            const response = await this._shipperService.postReview(shipperId, transporterId, rating, comment);

            res.status(HTTP_STATUS.OK).json(response)
            
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchTransportes(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const response = await this._shipperService.fetchTransporters();
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchTrucks(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const response = await this._shipperService.fetchTrucks();
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }
}


export default ShipperController