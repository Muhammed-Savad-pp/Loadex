import  express  from "express";
import AuthController from "../../controller/transporterController/authController";

const transporterAuth_route = express.Router();

const authController = new AuthController()

transporterAuth_route.post('/register', authController.signUp);

transporterAuth_route.post('/verifyOtp', authController.verifyOtp);

transporterAuth_route.post('/login', authController.signIn);

transporterAuth_route.post('/resendOtp', authController.resendOtp);

transporterAuth_route.post('/refresh-token', authController.validateRefreshToken);

transporterAuth_route.post('/logout', authController.logout)



export default transporterAuth_route;