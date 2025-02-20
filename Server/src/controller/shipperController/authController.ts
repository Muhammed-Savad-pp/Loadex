import { Request, Response } from "express";
import { AuthService } from "../../services/shipper/authService";
import { HTTP_STATUS } from "../../enums/httpStatus";

const authService = new AuthService();

class AuthController {

    async SignUp (req: Request, res: Response) {
        try {
            
            const {name, email, phone, password, confirmPassword} = req.body;

            const response = await  authService.shipperSignUp(
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
            
            const response = await authService.verifyShipperOtp(otp)

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
            
            const response = await authService.resendOtp(email)

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
            
            const response = await authService.shipperLogin(formData);

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
}


export default AuthController