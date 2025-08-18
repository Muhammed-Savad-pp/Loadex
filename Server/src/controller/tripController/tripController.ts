import { Response } from "express";
import { ITripController } from "../../interface/trip/ITripController";
import { ITripService } from "../../interface/trip/ITripService";
import { CustomeRequest } from "../../Middleware/userAuth";
import { HTTP_STATUS } from "../../enums/httpStatus";

export class TripController implements ITripController {

    constructor(
        private _tripService: ITripService,
    ) { }

    async fetchTripsForTransporter(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const transporterId = req.user?.id;
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);
            const status = req.query.status

            const response = await this._tripService.fetchTripsForTransporter(transporterId, status as string, page, limit);
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async updateTripStatus(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const { tripId, newStatus } = req.body;

            const response = await this._tripService.updateTripStatus(tripId, newStatus);
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchTripsForShipper(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const shipperId = req.user?.id;
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);
            const status = req.query.status as string;

            const response = await this._tripService.fetchTripsForShipper(shipperId, page, limit, status);

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchTripsForAdmin(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);
            const search = req.query.search as string;
            const status = req.query.status as string;

            const response = await this._tripService.fetchTripsForAdmin(page, limit, search, status);

            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.error(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async sendTripAmountToTransporter(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const { tripId } = req.body;
            const response = await this._tripService.sendTripAmountToTransporter(tripId)

            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }



}