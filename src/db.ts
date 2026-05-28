import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const uri = process.env.MONGO_URI;

async function connectDB(){
    try {
        await mongoose.connect(uri!);
        await mongoose.connection.db!.admin().command({ ping: 1 });
        console.log("MongoDB Connection Successful!")
    }
    catch (err) {
        console.log(err);
    }
}

async function disconnectDB(){
    try {
        await mongoose.disconnect();
        console.log("MongoDB Disconnected Successfully!")
    }
    catch (err) {
        console.log(err);
    }
}

export {connectDB, disconnectDB};