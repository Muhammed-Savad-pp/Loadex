import { Request, Response } from "express";

class AuthController {

    async SignUp (req: Request, res: Response) {
        try {
            
            const {name, email, phone, passsword, confirmPassword} = req.body;

            console.log(name, email, phone, passsword, confirmPassword);
            

        } catch (error) {
            console.log(error);
            
        }
    }

}


export default AuthController