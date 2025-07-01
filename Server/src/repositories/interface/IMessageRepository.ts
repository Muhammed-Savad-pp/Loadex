import { FilterQuery, UpdateWriteOpResult } from "mongoose";
import { IMessage } from "../../models/Message";
import { IBaseRepository } from "./IBaseRepository";


export interface IMessageRepository extends IBaseRepository<IMessage> {
    createMessage(messageData: Partial<IMessage>): Promise<IMessage>;
    updateMany(filter: FilterQuery<IMessage>, updateData: Partial<IMessage>): Promise<UpdateWriteOpResult>
}