import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        const response = await mongoose.connect(`mongodb+srv://bhartinagpure2409:123bharti@cluster0.5hu6t.mongodb.net/${DB_NAME}`)
        console.log("MongoDB connected", response)
    } catch (err) {
        console.error("connection failed ERROR: ", err.message)
        process.exit(1)
    }
}

export default connectDB;