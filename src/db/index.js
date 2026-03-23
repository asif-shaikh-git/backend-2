/* 2^ approach: SEPARATE DB CONNECTION AND SERVER STARTUP INTO DIFFERENT FILES
      SEE src/index.js FOR DB CONNECTION IMPLEMENTATION
*/   


import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";              

  const connectDB = async () => {
    try {
      const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
      console.log(`\n MongoDB connected || DB HOST: ${ connectionInstance.connection.host }`);
      console.log(connectionInstance.Connection ? "MongoDB connection successful" : "MongoDB connection failed");
    } catch (error) {
        console.log("MONGODB connection failed", error);
        process.exit(1);
    }
}

export default connectDB;

    


