import { Request,Response,NextFunction, response } from "express";
import { AuthService } from "../../services/transporter/authService";
import { HTTP_STATUS } from "../../enums/httpStatus";

const authService = new AuthService()

class AuthController {

    async signUp(req:Request, res:Response){
        try {
            
            const {name, email, phone, password, confirmPassword} = req.body;

            const respone = await authService.transporterSignup(
                name,
                email,
                phone, 
                password, 
                confirmPassword,
            )
            
            if(!respone.success) {

                res.status(HTTP_STATUS.BAD_REQUEST).json(respone);

            }else {

                res.status(HTTP_STATUS.CREATED).json(respone)

            }

        } catch (error) {
            console.log("error", error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: "Internal server error"})
        }
    }

    async verifyOtp(req: Request, res: Response) {
        try {

            const otp = req.body;

            const response = await authService.verifyTransporterOtp(otp)
            
            if(typeof response === "string"){

                res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response)
                return

            }else if (response?.success) {

                res.status(HTTP_STATUS.CREATED).json(response);
                return 

            }else {
                res.status(HTTP_STATUS.BAD_REQUEST).json(response)
            }
            
        } catch (error) {

            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: "otp verification faild"});
            return;
        }
    }

    async signIn(req: Request, res: Response) {
        const formData = req.body;
        try {
            
            const respone = await authService.transporterLogin(formData)

            if(respone.success){
                res.status(HTTP_STATUS.CREATED)
                .cookie('refreshToken',respone.refreshToken,
                    { 
                        httpOnly: true,
                        secure: true,
                        sameSite: 'none',
                        maxAge: 3 * 24 * 60 * 1000
                    }
                )
                .json({success: true, message: 'Logged in successfully', accessToken: respone.accessToken, role:'transporter', data:respone.data})
            } else {
                res.status(HTTP_STATUS.BAD_REQUEST).json(respone)
            }

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: 'Internal Server error'})
        }
    }

    async resendOtp(req: Request, res: Response) {

        const email = req.body;
        
        try {

            const response = await authService.resendOtp(email)

            if(typeof response === 'string') {
                res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response);
                return
            }

            if(response.success){
                res.status(HTTP_STATUS.CREATED).json(response);
                return
            } 
                       
        } catch (error) {
            console.log(error);
        }
    }

    async validateRefreshToken (req: Request, res: Response) {
        try {
            console.log('controller');
            
            console.log('req.cookies: ', req.cookies.refreshToken);

            if(!req.cookies.refreshToken) {
                console.log('er');
                
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Refresh token not found'
                })
                return;
            }

            console.log('here');
            

            const {accessToken, refreshToken} = await authService.validateRefreshToken(req.cookies.refreshToken); 

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 3 * 24 * 60 * 1000,
                sameSite: 'none',
            });

            res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'token Created',
                token: accessToken,
                role: "transporter"
            })
            

        } catch (error: any) {
            
            if(error.status === 401) {
                res.status(HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: error.message
                })
                return;
            }

            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'An internal server error occurred'
            })
        }
    }

    async logout(req: Request, res: Response) {
        try {
            
            res.clearCookie('refreshToken');
            res.json({message: 'Logout successFully'})
            return

        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: 'controller error'})
        }
    }

    
}


export default AuthController