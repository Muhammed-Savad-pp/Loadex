import Notification, { INotification } from "../../models/NotificationModel";
import { INotificationRepository } from "../interface/INotificationRepository";
import { BaseRepositories } from "./baseRepositories";


class NotificationRepository extends BaseRepositories<INotification> implements INotificationRepository {
    
    constructor () {
        super(Notification)
    }

    async createNotification(notificationData: Partial<INotification>): Promise<INotification> {
        try {

            return await this.model.create(notificationData)
            
        } catch (error) {
            throw new Error(`Error in while create notification ${error instanceof Error ? error.message : String(error)}`)
        }
    }
}

export default new NotificationRepository()