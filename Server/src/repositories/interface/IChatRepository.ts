import { IChat } from "../../models/Chat";
import { IBaseRepository } from "./IBaseRepository";

export interface IChatRepository extends IBaseRepository<IChat> {

    createChat(chatData: Partial<IChat>): Promise<IChat>
    updateLastMessage(chatId: string, message: string): Promise<IChat | null>
}
