import { ShipperRepositories } from "../../repositories/implementaion/shipper/shipperRepositories";
import bcrypt from "bcryptjs";


async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
}


export class AuthService {

    private shipperRepositories : ShipperRepositories;

    constructor(){
        this.shipperRepositories = new ShipperRepositories();
    }

    



}