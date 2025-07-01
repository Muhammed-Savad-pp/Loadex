import Chat, { IChat } from "../../models/Chat";
import { IChatRepository } from "../interface/IChatRepository";
import { BaseRepositories } from "./baseRepositories";


class ChatRepository extends BaseRepositories<IChat> implements IChatRepository {

    constructor() {
        super(Chat)
    }

    async createChat(chatData: Partial<IChat>): Promise<IChat> {
        try {
            
            return await this.model.create(chatData)

        } catch (error) {
            throw new Error(`Error while creating chat: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    async updateLastMessage(chatId: string, message: string): Promise<IChat | null> {
        try {
            
            return await this.updateById(chatId, {lastMessage: message})

        } catch (error) {
            throw new Error(`Error wile update the lastMessage ${error instanceof Error ? error.message : String(error)}`)
        }
    }

}

export default new ChatRepository()