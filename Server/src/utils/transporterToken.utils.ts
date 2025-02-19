import  jwt  from "jsonwebtoken";
import { ITransporter } from "../models/transporter/TransporterModel";
import exp from "constants";

export const generateAcessToken = async (transporterId: string, role: string) => {
    const secret = process.env.JWT_ACESSTOKEN;

    if(!secret) {
        throw new Error('acessToken not working')
    }

    const respone = await jwt.sign( {transporterId, role}, secret, {expiresIn: "24h"})
    console.log('acessToken', respone)

    return respone
}

export const generateRefreshToken = async (transporterId: string, role: string ) => {
    const secret = process.env.JWT_REFRESHTOKEN;

    if(!secret){
        throw new Error('Refresh token not working')
    }

    const respone = await jwt.sign({transporterId, role}, secret, {expiresIn: "3d"})

    console.log('refreshToken',respone);

    return respone
}