import { Response } from "express";
import { IBidController } from "../../interface/bid/IBidController";
import { IBidService } from "../../interface/bid/IBidService";
import { CustomeRequest } from "../../Middleware/userAuth";
import { HTTP_STATUS } from "../../enums/httpStatus";

export class BidController implements IBidController {
    constructor(
        private _bidService: IBidService,
    ) { }

    async createBid(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const formData = req.body;
            const transporterId = req.user?.id;
            const response = await this._bidService.createBid(formData, transporterId);

            res.status(HTTP_STATUS.CREATED).json(response)
        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchBidsForTransporter(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const transporterId = req.user?.id;
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);
            const status = req.query.status as string;

            const resposne = await this._bidService.fetchBidsForTransporter(transporterId, page, limit, status);

            res.status(HTTP_STATUS.OK).json(resposne)

        } catch (error) {
            console.log(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async updateBid(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const bidId = req.params.id;
            const { truckId, price } = req.body;
            const response = await this._bidService.updateBid(bidId, truckId, price);

            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.error(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async deleteBidById(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const bidId = req.params.id;

            const response = await this._bidService.deleteBidById(bidId as string)
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.error(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchBidsForShipper(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const shipperId = req.user?.id;
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);
            const status = req.query.status as string;

            const response = await this._bidService.fetchBidsForShipper(shipperId, page, limit, status);
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async updateBidStatusByShipper(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const bidId = req.params.id;
            const { status } = req.body;

            const response = await this._bidService.updateBidStatusByShipper(bidId, status);
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }



}

