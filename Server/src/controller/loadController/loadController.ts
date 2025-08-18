import { Response } from "express";
import { ILoadController } from "../../interface/load/ILoadController";
import { ILoadService } from "../../interface/load/ILoadService";
import { CustomeRequest } from "../../Middleware/userAuth";
import { HTTP_STATUS } from "../../enums/httpStatus";

export class LoadController implements ILoadController {

    constructor(
        private _loadService: ILoadService
    ) { }

    async postLoad(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const shipperId = req.user?.id;
            const formData = req.body.formData;

            const response = await this._loadService.createLoad(shipperId, formData);

            res.status(HTTP_STATUS.CREATED).json(response)

        } catch (error: any) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async fetchLoads(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);

            const shipperId = req.user?.id;
            const response = await this._loadService.getShipperLoads(shipperId, page, limit);

            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async updateLoad(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const shipperId = req.user?.id;
            const { formData } = req.body;

            const response = await this._loadService.updateLoad(formData);
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.error(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async deleteLoad(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const loadId = req.params.id;
            const response = await this._loadService.deleteLoadByLoadId(loadId as string)

            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.error(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async loadsForAdmin(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);
            const search = req.query.search as string;
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;

            const response = await this._loadService.loadsForAdmin(page, limit, search, startDate, endDate);
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error: any) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message })
        }
    }

    async loadsForTransporter(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;

            const respone = await this._loadService.loadsForTransporter(page, limit);

            res.status(HTTP_STATUS.OK).json(respone)
        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

}