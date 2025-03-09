import { Request, Response } from "express";
import { ShipperService } from "../../services/shipper/shipperService";
import { HTTP_STATUS } from "../../enums/httpStatus";
import { IShipperService } from "../../interface/shipper/IShipperService";
import { IShipperController } from "../../interface/shipper/IShipperController";
import { CustomeRequest } from "../../Middleware/userAuth";

// const shipperService = new ShipperService();

class ShipperController implements IShipperController {

    constructor(private shipperService: IShipperService ) {}

    async SignUp (req: Request, res: Response) {
        try {
            
            const {name, email, phone, password, confirmPassword} = req.body;

            const response = await  this.shipperService.shipperSignUp(
                name, email, phone, password, confirmPassword
            )

            if(!response.success) {

                res.status(HTTP_STATUS.BAD_REQUEST).json(response)

            } else {

                res.status(HTTP_STATUS.CREATED).json(response)

            }
            
        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: 'Internal Server Error'})
        }
    }

    async verifyOtp (req: Request, res: Response) {
        try {
            
            const otp = req.body;
            
            const response = await this.shipperService.verifyShipperOtp(otp)

            if(typeof response === 'string') {
                
                res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response)
                return
            
            } else if(response?.success){
                
                res.status(HTTP_STATUS.CREATED).json(response);
                return
            
            } else {
                res.status(HTTP_STATUS.BAD_REQUEST).json(response)
            }

        } catch (error) {
            console.log(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: 'OTP verification failed'})
        }
    }

    async resendOtp (req: Request, res: Response) {
        const email = req.body;
        try {
            
            const response = await this.shipperService.resendOtp(email)

            if(typeof response == 'string') {

                res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response)
            } 

            if(response.success) { 
                res.status(HTTP_STATUS.CREATED).json(response)
            }

            
        } catch (error) {
            console.log(error);
            
        }
    }

    async signIn(req: Request, res: Response) {

        const formData = req.body;

        try {
            
            const response = await this.shipperService.shipperLogin(formData);

            if(response.success) {
                res.status(HTTP_STATUS.CREATED)
                .cookie('refreshToken', response.refreshToken,
                    {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'none',
                        maxAge: 7 * 24 * 60 * 1000 
                    }
                )
                .json({success: true, message:"Logged in successFully", accessToken: response.accessToken, role:"shipper", data:response.data});
            } else {
                res.status(HTTP_STATUS.BAD_REQUEST).json(response)
            }


        } catch (error) {
            console.log(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: "Internal Server error"})
        }
    }

    async Logout(req: Request, res: Response) {
        try {

            res.clearCookie('refreshToken');
            res.json({message: 'Logout Successfully'});
            return ;
            
        } catch (error) {
            console.log('error in controller', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: error})
        }
    }

    async getProfileData(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const id = req.user?.id

            const response = await this.shipperService.getShipperProfileData(id);

            if(!response.success){
                res.status(HTTP_STATUS.NOT_FOUND).json(response);
                return
            }

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.error('error in getProfileData in controller', error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: error})
        }
    }

    async registerKyc(req: CustomeRequest, res: Response): Promise<void> {
        try {
            
            const {companyName, panNumber, gstNumber} = req.body;
            const shipperId = req.user?.id;


            // console.log(companyName)
            // console.log(panNumber)
            // console.log(gstNumber)
            
            const aadhaarFront = (req.files as any)?.aadhaarFront?.[0];
            const aadhaarBack = (req.files as any)?.aadhaarBack?.[0];

            // console.log(aadhaarFront)
            // console.log(aadhaarBack)

            const response = await this.shipperService.registerKyc(shipperId, companyName, panNumber, gstNumber, aadhaarFront, aadhaarBack);
            console.log(response);
            

            if(!response.success) {
                res.status(HTTP_STATUS.NOT_FOUND).json(response)
            }

            res.status(HTTP_STATUS.OK).json(response)



        } catch (error) {
            console.error('error in registerKyc in controller',  error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }
}


export default ShipperController