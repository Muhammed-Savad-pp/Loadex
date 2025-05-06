import  Express  from "express";
import mongoose from "mongoose";;
import config from "./config";
import cors from "cors";
import morgan from "morgan"
import cookieParser from "cookie-parser";
import transporterAuth_route from "./routes/transporter/auth";
import shipperAuth_rote from "./routes/shipper/auth";
import transporter_route from "./routes/transporter/transporter";
import admin_route from "./routes/admin/adminRoute";
import shipper_route from "./routes/shipper/shipper";
import { HTTP_STATUS } from "./enums/httpStatus";


const app = Express();

app.use(morgan("dev"))

app.use(Express.json())

app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))

app.use(cookieParser())

mongoose
    .connect(config.mongoURI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("mongoose error", err))

app.use('/transporter/auth', transporterAuth_route)
app.use('/shipper/auth', shipperAuth_rote)

app.use('/transporter', transporter_route);
app.use('/shipper', shipper_route);

app.use('/admin', admin_route);

app.use('*', (req, res) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: 'Route not found',
        status: 404
    })
})


app.listen(config.port, () => {
    console.log("server is running");
    console.log('http://localhost:4000');    
})