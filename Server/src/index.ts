import  Express  from "express";
import mongoose from "mongoose";;
import config from "./config";
import cors from "cors";
import transporterAuth_route from "./routes/transporter/auth";

const app = Express();

// const corsOptions = {
//     origin:'http://localhost:5173',
//     // methods:['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     // allowedHeaders:['Content-Type', 'Authorization'],
//     credential:true
// }

// app.use(cors(corsOptions))
app.use(Express.json())
app.use(cors({
    origin:'http://localhost:5173',
    credentials:true
}))

mongoose
    .connect(config.mongoURI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("mongoose error", err))


app.get('/' , (req, res) => {
    res.send("hello")
}) 

app.use('/', transporterAuth_route)



app.listen(config.port, () => {
    console.log("server is running");
    console.log('http://localhost:3000');    
})