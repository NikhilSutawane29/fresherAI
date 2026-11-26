

import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Connect DB billing")
    } catch (error) {
        console.log("MongoDB error", error)
    }
}


