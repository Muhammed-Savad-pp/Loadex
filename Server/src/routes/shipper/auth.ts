import express from "express";
import AuthController from "../../controller/shipperController/authController";


const shipperAuth_rote = express.Router()

const authController = new AuthController();

shipperAuth_rote.post('/register',authController.SignUp);

shipperAuth_rote.post('/verifyOtp',authController.verifyOtp);

shipperAuth_rote.post('/resendOtp', authController.resendOtp);

shipperAuth_rote.post('/login', authController.signIn)


export default shipperAuth_rote;