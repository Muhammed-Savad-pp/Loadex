import  jwt, { JwtPayload }  from "jsonwebtoken";
import { ITransporter } from "../models/transporter/TransporterModel";
import exp from "constants";
import { HTTP_STATUS } from "../enums/httpStatus";

export const generateAcessToken = async (id: string, role: string) => {
    const secret = process.env.JWT_ACESSTOKEN;

    if(!secret) {
        throw new Error('acessToken not working')
    }

    const respone = await jwt.sign( {id, role}, secret, {expiresIn: '2h'})
    console.log('acessToken', respone)

    return respone
}

export const generateRefreshToken = async (id: string, role: string ) => {
    const secret = process.env.JWT_REFRESHTOKEN;

    if(!secret){
        throw new Error('Refresh token not working')
    }

    const respone = await jwt.sign({id, role}, secret, {expiresIn: '3d'})

    console.log('refreshToken',respone);

    return respone
}

export const verifyToken = (token: string): JwtPayload => {
    try {
        
        const decoded = jwt.verify(token, process.env.JWT_REFRESHTOKEN as string) as JwtPayload;
        console.log('decoded in util ', decoded);
        return decoded
        

    } catch (err) {
        const error: any = new Error('Token_expired');
        error.status = HTTP_STATUS.UNAUTHORIZED;
        throw error
    }
}