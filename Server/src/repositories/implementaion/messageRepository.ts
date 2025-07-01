
import mongoose, {Document, Schema, Types, UpdateWriteOpResult} from "mongoose";
import { BaseRepositories } from "./baseRepositories";
import Message, { IMessage } from "../../models/Message";
import { IMessageRepository } from "../interface/IMessageRepository";


class MessageRepository extends BaseRepositories<IMessage> implements IMessageRepository {

    constructor() {
        super(Message)
    }

    async createMessage(messageData: Partial<IMessage>): Promise<IMessage> {
        try {
            
            return await this.model.create(messageData);

        } catch (error) {
            console.log(error);
            throw new Error(`Error in Create message: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async updateMany(filter: mongoose.FilterQuery<IMessage>, updateData: Partial<IMessage>): Promise<UpdateWriteOpResult> {
        try {
            
            return await this.model.updateMany(filter, { $set: updateData})

        } catch (error) {
            throw new Error(`Error in updateMany ${error instanceof Error ? error.message : String(error)}`)
        }
    }

}

export default new MessageRepository()