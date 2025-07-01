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
import runSubscriptionExpiryJob from "./cron-job/subscription";
import runBidExpiredAndRefund from "./cron-job/bidRefund";
import http from 'http'
import { Server } from "socket.io";
import { setupSocket } from "./sockets/chatSocket";
import runCheckLoadExpired from "./cron-job/loadExpired";
import { logger, morganStream } from "./Middleware/logger";



const app = Express();

app.use(morgan("combined", { stream: morganStream}));

app.use(Express.json())

app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))

app.use(cookieParser())

runSubscriptionExpiryJob();
runBidExpiredAndRefund();
runCheckLoadExpired()


mongoose
    .connect(config.mongoURI)
    .then(() => logger.info("MongoDB connected"))
    .catch((err) =>  logger.error("Mongoose connection error: " + err.message));

 

app.use('/transporter/auth', transporterAuth_route)
app.use('/shipper/auth', shipperAuth_rote)
app.use('/transporter', transporter_route);
app.use('/shipper', shipper_route);
app.use('/admin', admin_route);
    
// app.use('*', (req, res) => {
//     logger.warn(`404 - Route not found: ${req.originalUrl}`);
//     res.status(HTTP_STATUS.NOT_FOUND).json({
//         message: 'Route not found',
//         status: 404
//     })
// })

app.get('/', (req, res) => {
  res.status(200).json({ message: "🚚 Loadex API is running" });
});

const server = http.createServer(app);
setupSocket(server)

// app.listen(config.port, () => {
//     console.log("server is running");
//     console.log('http://localhost:4000');    
// })

server.listen(config.port, () => {
    // console.log(`🚀 Server running at http://localhost:${config.port}`)
    logger.info(`🚀 Server running at http://localhost:${config.port}`);
})