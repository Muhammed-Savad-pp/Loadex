import dotenv from "dotenv";
dotenv.config()

const config = {
    mongoURI : process.env.MONGO_URI || "mongodb://localhost:27017/Loadex",
    port : process.env.PORT
}


export default config;
