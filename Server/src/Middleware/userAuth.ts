import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../enums/httpStatus";


export interface CustomeRequest extends Request {
    user?: JwtPayload;
    userId?: string;
}

const authenticateToken = (req: CustomeRequest, res: Response, next: NextFunction) => {
    try {

        const token = req.headers['authorization'];

        console.log(token);
        

        if (!token) {
            res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Access denied. No token' })
            return
        }

        const newToken = token.split(' ')[1];
        const secret = process.env.JWT_ACESSTOKEN

        if (!secret) {
            throw new Error('Access token secret is not defined');
        }

        jwt.verify(newToken, secret, (err, payload) => {

            console.log('verify done', payload);

            if (err) {

                res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'Invalid token' })
                return
            }

            const user = jwt.decode(newToken);
            req.user = user as JwtPayload;

            next()

        })

    } catch (error) {

        console.error('error occured in authenticateToken middleware', error);
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'An error occured while authenticating' })

    }
}

export default authenticateToken;

