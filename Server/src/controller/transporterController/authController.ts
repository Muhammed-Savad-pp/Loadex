import { Request,Response,NextFunction } from "express";

class AuthController {


    async signUp(req:Request, res:Response){
        try {
            
            const {name, email, phone, password} = req.body;
            console.log(name, email, phone, password, "sssss")
            console.log('sss')
            res.status(200).json({message:'Success'})

            return
        } catch (error) {
            console.log("error", error);
             res.status(404).json({message:'Failed'})
             return
        }
    }
}


export default AuthController