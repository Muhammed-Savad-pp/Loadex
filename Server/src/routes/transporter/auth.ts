import  express  from "express";
import AuthController from "../../controller/transporterController/authController";
import { AuthService } from "../../services/transporter/authService";
import transporterRepository from "../../repositories/implementaion/transporterRepository";
import OtpRepository  from "../../repositories/implementaion/otpRepositories";

const transporterAuth_route = express.Router();

const transporterAuthService = new AuthService(transporterRepository, OtpRepository);
const transporterAuthController = new AuthController(transporterAuthService)


transporterAuth_route.post('/register', transporterAuthController.signUp.bind(transporterAuthController));

transporterAuth_route.post('/verifyOtp', transporterAuthController.verifyOtp.bind(transporterAuthController));

transporterAuth_route.post('/login', transporterAuthController.signIn.bind(transporterAuthController));

transporterAuth_route.post('/resendOtp', transporterAuthController.resendOtp.bind(transporterAuthController));

transporterAuth_route.post('/refresh-token', transporterAuthController.validateRefreshToken.bind(transporterAuthController));

transporterAuth_route.post('/logout', transporterAuthController.logout.bind(transporterAuthController));

transporterAuth_route.post('/forgotPassword', transporterAuthController.forgotPassword.bind(transporterAuthController));

transporterAuth_route.post('/changePassword', transporterAuthController.changeNewPassword.bind(transporterAuthController));

transporterAuth_route.post('/googleLogin', transporterAuthController.googleLogin.bind(transporterAuthController))



export default transporterAuth_route;