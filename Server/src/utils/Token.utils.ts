import  jwt, { JwtPayload }  from "jsonwebtoken";
import { ITransporter } from "../models/TransporterModel";
import exp from "constants";
import { HTTP_STATUS } from "../enums/httpStatus";
import config from "../config";

export const generateAcessToken = async (id: string, role: string) => {
    const secret = config.jwtAccessToken;

    if(!secret) {
        throw new Error('acessToken not working')
    }

    const respone = await jwt.sign( {id, role}, secret, {expiresIn: '2h'})

    return respone
}

export const generateRefreshToken = async (id: string, role: string ) => {
    const secret = config.jwtRefreshToken;

    if(!secret){
        throw new Error('Refresh token not working')
    }

    const respone = await jwt.sign({id, role}, secret, {expiresIn: '3d'})

    console.log('refreshToken',respone);

    return respone
}

export const verifyToken = (token: string): JwtPayload => {
    try {
        
        const decoded = jwt.verify(token, config.jwtRefreshToken as string) as JwtPayload;
        console.log('decoded in util ', decoded);
        return decoded
        

    } catch (err) {
        const error: any = new Error('Token_expired');
        error.status = HTTP_STATUS.UNAUTHORIZED;
        throw error
    }
}