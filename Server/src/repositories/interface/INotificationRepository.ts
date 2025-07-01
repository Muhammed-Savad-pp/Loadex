import { INotification } from "../../models/NotificationModel";
import { BaseRepositories } from "../implementaion/baseRepositories";


export interface INotificationRepository extends BaseRepositories<INotification> {
    createNotification(notificationData: Partial<INotification>): Promise<INotification>;
}