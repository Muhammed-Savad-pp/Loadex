import { plainToInstance } from "class-transformer"
import { validate } from "class-validator";
import { NextFunction, Response } from "express"
import { CustomeRequest } from "./userAuth";


export const validateDto = (DtoClass: any) => {
    return async (req: CustomeRequest, res: Response, next: NextFunction) => {
        
        console.log(req.body, '..................')
        const rawData = req.body.formData || req.body;
        console.log(rawData, '.........................................')
        const dtoObj = plainToInstance(DtoClass, rawData, { enableImplicitConversion: true});
        const errors = await validate(dtoObj);

        if(errors.length > 0) {
            const messages = errors.map(err => Object.values(err.constraints || {})).flat();
            res.status(400).json({ errors: messages});
            return
        }

        next()
    }
}