import { Request,Response } from "express";
import { HTTP_STATUS } from "../../enums/httpStatus";
import { ITransporterAuthController } from "../../interface/transporter/ITransporterAuthController";
import { ITransporterAuthService } from "../../interface/transporter/ITransporterAuthService";

class AuthController implements ITransporterAuthController {

    constructor ( private _transporterAuthService: ITransporterAuthService ) {}

    async signUp(req:Request, res:Response){
        try {
            const {name, email, phone, password, confirmPassword} = req.body;

            const respone = await this._transporterAuthService.transporterSignup(
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

            const response = await this._transporterAuthService.verifyTransporterOtp(otp)
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
            const respone = await this._transporterAuthService.transporterLogin(formData)

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
                .json({success: true, message: 'Logged in successfully', accessToken: respone.accessToken, role:'transporter'})
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
            const response = await this._transporterAuthService.resendOtp(email)

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
            
            if(!req.cookies.refreshToken) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Refresh token not found'
                })
                return;
            }            

            const {accessToken, refreshToken} = await this._transporterAuthService.validateRefreshToken(req.cookies.refreshToken); 

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

    async forgotPassword (req: Request, res: Response) {
        try {
            
            const {email} = req.body;
            const response = await this._transporterAuthService.forgotPassword(email);

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error : any) {
            console.log(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: error.message})
        }
    }

    async changeNewPassword(req: Request, res: Response) {
        try {
            const {email, password} = req.body;
            const response = await this._transporterAuthService.setNewPassword(email, password);

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error: any) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: error.message})
        }
    }


    async googleLogin(req: Request, res: Response): Promise<void> {
        try {
            const {name, email} = req.body;

            const response = await this._transporterAuthService.googleLogin(name, email);
            if(response.success){
                res.status(HTTP_STATUS.CREATED)
                .cookie('refreshToken',response.refreshToken,
                    { 
                        httpOnly: true,
                        secure: true,
                        sameSite: 'none',
                        maxAge: 3 * 24 * 60 * 1000
                    }
                )
                .json({success: true, message: 'Logged in successfully', accessToken: response.accessToken, role:'transporter',})
            } else {
                res.status(HTTP_STATUS.BAD_REQUEST).json(response)
            }
        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }
    
}


export default AuthController