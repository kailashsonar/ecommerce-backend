import mongoose from "mongoose";

export const connectionDb = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.DB_CONNECTION_URL);
        console.log("db is connected");
    } catch (error) {
        console.log("error while connecting with database", error.message);
        process.exit(1);
    }
}