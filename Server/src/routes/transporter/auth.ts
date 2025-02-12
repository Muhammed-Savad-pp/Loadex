import  express  from "express";
import AuthController from "../../controller/transporterController/authController";

const transporterAuth_route = express.Router();

const authController = new AuthController()

transporterAuth_route.post('/transporter/register', authController.signUp)



export default transporterAuth_route;