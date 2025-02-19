import express from "express";
import AuthController from "../../controller/shipperController/authController";


const shipperAuth_rote = express.Router()

const authController = new AuthController();

shipperAuth_rote.post('/register',authController.SignUp)


export default shipperAuth_rote;