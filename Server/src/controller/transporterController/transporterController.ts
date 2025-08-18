import { Response, response } from "express";
import { CustomeRequest } from "../../Middleware/userAuth";
import { HTTP_STATUS } from "../../enums/httpStatus";
import { ITransporterService } from "../../interface/transporter/ITransporterService";
import { ITransporterController } from "../../interface/transporter/ITransporterController";

export class TransporterController implements ITransporterController{

    constructor(private _transporterService: ITransporterService) {}

    async verificationStatus(req: CustomeRequest, res: Response): Promise<void> {
        try {            
            const id = req.user?.id

            const response = await this._transporterService.verificationStatus(id)
            if(!response.success) {
                res.status(HTTP_STATUS.BAD_REQUEST).json(response);
                return;
            }
            
            res.status(HTTP_STATUS.OK).json(response)
            
        } catch (error) {
            console.log(error)
        }
    }

    async getProfileData (req: CustomeRequest, res: Response) : Promise<void> {
        try {
            const transporterId = req.user?.id

            const response = await this._transporterService.getProfileData(transporterId);
            if(!response.success) {
                res.status(HTTP_STATUS.BAD_REQUEST).json(response)
                return
            }

            res.status(HTTP_STATUS.OK).json(response)
        } catch (error) {
            console.log(error)
        }
    }

    async kycVerification (req: CustomeRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id
            const {panNumber} = req.body;

            const aadhaarFront = ( req.files as any )?.aadhaarFront?.[0];
            const aadhaarBack = ( req.files as any )?.aadhaarBack?.[0];
            
            const response = await this._transporterService.kycVerification(userId, panNumber, aadhaarFront, aadhaarBack)
            if( !response ) {
                res.status(HTTP_STATUS.NOT_FOUND).json(response)
            } else {
                res.status(HTTP_STATUS.OK).json(response)
            }

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(response)
        }
    }

    async bidCheckoutSession(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const {bidId} = req.body;

            const response = await this._transporterService.bidCheckoutSession(bidId);
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async verifyBidPayment(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const {transactionId, status } = req.body;

            const response = await this._transporterService.verifyBidPayment(transactionId, status);
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async updateProfile(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const transporterId = req.user?.id;
            const formData = req.body;
            const {name, phone } = formData;

            const profileImage = (req.files as any)?.profileImage?.[0]
        
            const response = await this._transporterService.updateProfile(transporterId, name, phone, profileImage);
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }   
    }

    async fetchShipperProfileData(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const transporterId = req.user?.id;
            const { shipperId }  = req.params;

            const response = await this._transporterService.fetchShipperProfileData(transporterId, shipperId);
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async followShipper(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const { shipperId } = req.body;
            const transporterId = req.user?.id;

            const response = await this._transporterService.followShipper(transporterId, shipperId);
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async unfollowShipper(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const tranpsorterId = req.user?.id;
            const { shipperId } = req.body;

            const response = await this._transporterService.unFollowShipper(tranpsorterId, shipperId);
            res.status(HTTP_STATUS.OK).json(response);
            
        } catch (error) {
            console.error(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async postReview(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const transporterId = req.user?.id;
            const { shipperId, rating, comment } = req.body;

            const response = await this._transporterService.postReviews(transporterId, shipperId, rating, comment);
            res.status(HTTP_STATUS.OK).json(response);
            
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchShippers(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);
            const search = req.query.search as string;
            
            const response = await this._transporterService.fetchShippers(page, limit, search);
            res.status(HTTP_STATUS.OK).json(response)            

        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchFollowersAndFollowings(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const transporterId = req.user?.id;
            const status = req.query.status as string;
            const search = req.query.search as string;
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string)
            
            const response = await this._transporterService.fetchTransporterFollowersandFollowings(transporterId, status, search, page, limit);
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchSubscriptionPlans(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const response = await this._transporterService.fetchSubscriptionPlans();
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async subscriptionCheckoutSession(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const transporterId = req.user?.id;
            const { planId } = req.body;

            const response = await this._transporterService.subscriptionCheckoutSession(transporterId, planId);
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async subscriptionSuccess(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const transporterId = req.user?.id;
            const { sessionId, planId} = req.body;
            
            const response = await this._transporterService.subscriptionSuccess(transporterId, sessionId, planId);
            res.status(HTTP_STATUS.OK).json(response);
            
        } catch (error) {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchPaymentHistory(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const transporterId = req.user?.id;
            const status = req.query.status as string;
            const type = req.query.type as string;
            const date = req.query.date as string;
            const page = parseInt(req.query.page as string);
            const limit = parseInt(req.query.limit as string);

            const response = await this._transporterService.fetchPaymentHistory(transporterId, status, type, date, page, limit);
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async createChat(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const transporterId = req.user?.id;
            const { shipperId } = req.body;

            const response = await this._transporterService.startChat(transporterId, shipperId);
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchChat(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const transporterId = req.user?.id;

            const response = await this._transporterService.fetchChats(transporterId);
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.error(error)
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async sendMessage(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const transporterId = req.user?.id;
            const { chatId, shipperId, message } = req.body;

            const response = await this._transporterService.sendMessage(transporterId, chatId, shipperId, message);
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchMessages(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const chatId = req.params.chatId;

            const response = await this._transporterService.fetchMessages(chatId);
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchCurrentTransporterId(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const transporterId = req.user?.id;
            res.status(HTTP_STATUS.OK).json({transporterId: transporterId})

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async updateMessageAsRead(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const transporterId = req.user?.id;
            const chatId = req.params.chatId;

            const response = await this._transporterService.updateMessageAsRead(chatId, transporterId);
            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchNotifications(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const transporterId = req.user?.id;
            const filter = req.query.filter as string;

            const response = await this._transporterService.fetchNotifications(transporterId, filter);
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async updateNotificationAsRead(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const { notificationId } = req.body;

            const response = await this._transporterService.updateNotificationAsRead(notificationId);
            res.status(HTTP_STATUS.OK).json(response)
            
        } catch (error) {
            console.log(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }   

    async deleteNotification(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const notificationId = req.params.notificationId;

            const response = await this._transporterService.deleteNotification(notificationId);
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async fetchWalletData(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const transporterId = req.user?.id;
            
            const response = await this._transporterService.fetchWalletData(transporterId)            
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async bidPaymentByWallet(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const transporterId = req.user?.id;

            const { bidId } = req.body;
            const response = await this._transporterService.bidPaymentByWallet(transporterId, bidId);

            res.status(HTTP_STATUS.OK).json(response);

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }

    async findUnreadNotificationCount(req: CustomeRequest, res: Response): Promise<void> {
        try {
            const transporterId = req.user?.id;

            const response = await this._transporterService.findUnreadNotificationCount(transporterId);
            res.status(HTTP_STATUS.OK).json(response)

        } catch (error) {
            console.error(error);
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(error)
        }
    }
}

