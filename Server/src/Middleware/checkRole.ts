import { HTTP_STATUS } from "../enums/httpStatus";
import { CustomeRequest } from "./userAuth";
import { Response, NextFunction } from "express";

export const checkRole = (allowedRole: string) => {
    return (req: CustomeRequest, res: Response, next: NextFunction): void => {
          const userRole = req.user?.role;
          console.log(userRole, 'userRole');

          console.log('allowed role' ,allowedRole);
          
          if(!userRole) {
             res.status(HTTP_STATUS.UNAUTHORIZED).json({message: 'Unauthorized: No role found'});
             return;
          }

          if(allowedRole !== userRole){
             res.status(HTTP_STATUS.FORBIDDEN).json({message: 'Forbidden: Insufficient role access'});
             return;
          }

        next()
    }
}