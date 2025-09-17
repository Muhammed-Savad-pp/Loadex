import { Response } from "express";
import { HTTP_STATUS } from "../../enums/httpStatus";
import { ITruckController } from "../../interface/truck/ITruckController";
import { ITruckService } from "../../interface/truck/ITruckService";
import { CustomeRequest } from "../../Middleware/userAuth";

export class TruckController implements ITruckController {

    constructor(
        private _truckService: ITruckService
    ) { }

    async findTrucks(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const transporterId = req.user?.id;
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);
            const status = req.query.status;

            const response = await this._truckService.findTrucks(transporterId, status as string, page, limit);
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async registerTruck(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const formDataToSend = req.body;
            const transporterId = req.user?.id

            const truckData = {
                ...formDataToSend,
                currentLocationCoords: JSON.parse(formDataToSend.currentLocationCoords),
                fromCoords: JSON.parse(formDataToSend.fromCoords),
                toCoords: JSON.parse(formDataToSend.toCoords),
            };


            const rcBook = (req.files as any)?.rcBook?.[0]
            const driverLicense = (req.files as any)?.driverLicense?.[0];
            const truckImage = (req.files as any)?.truckImage?.[0]

            const response = await this._truckService.registerTruck(transporterId, truckData, rcBook, driverLicense, truckImage)

            if (response) {
                res.status(HTTP_STATUS.CREATED).json(response)
            } else {
                res.status(HTTP_STATUS.BAD_REQUEST).json(response)
            }

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async updateTruckAvailable(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const formdata = req.body;

            const driverLicensefile = (req.files as any)?.driverLicenseFile?.[0]

            const response = await this._truckService.updateTruckAvailable(formdata, driverLicensefile);

            res.status(HTTP_STATUS.OK).json(response)


        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchActiveTruck(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const transporterId = req.user?.id;

            const response = await this._truckService.fetchActiveTrucks(transporterId);
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async updateTruck(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const updateData = req.body;
            const truckImage = req.file;

            const response = await this._truckService.updateTruck(updateData, truckImage);

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchTrucksForShipper(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);

            const response = await this._truckService.fetchTrucksForShipper(page, limit);
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async getRequestedTrucksForAdmin(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const response = await this._truckService.getRequestedTrucksForAdmin();

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error: any) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message })
        }
    }

    async changeTruckVerificationStatusByAdmin(req: CustomeRequest, res: Response): Promise<void> {
        try {

            const { id, status, rejectReason } = req.body;

            console.log(rejectReason, 'reason')
            const response = await this._truckService.changeTruckVerificationStatusByAdmin(id, status, rejectReason);
            res.status(HTTP_STATUS.OK).json({ response });

        } catch (error: any) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: error.message })
        }
    }
}