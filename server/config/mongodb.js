import mongoose from "mongoose";
import { logError, logInfo } from '../utils/logger.js';

const connectDB = async ()=>{

    mongoose.connection.on('connected', ()=> logInfo("Database connected"));
    mongoose.connection.on('error', (error) => logError('MongoDB connection error', error));
    mongoose.connection.on('disconnected', () => logInfo('MongoDB disconnected'));

    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/teamalpha`);
    }catch(error){
        logError('Failed to connect to database', error);
    }
}

export default connectDB;