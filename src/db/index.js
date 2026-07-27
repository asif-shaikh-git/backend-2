/* 2^ approach: SEPARATE DB CONNECTION AND SERVER STARTUP INTO DIFFERENT FILES
      SEE src/index.js FOR DB CONNECTION IMPLEMENTATION
*/   


import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";              

  const connectDB = async () => {
    try {
      const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
      console.log(`\n MongoDB connected || DB HOST: ${ connectionInstance.connection.host }`);
      console.log(connectionInstance.connection ? "MongoDB connection successful" : "MongoDB connection failed");
      return connectionInstance;

    } catch (error) {
        console.log("MONGODB connection failed", error);
        process.exit(1);
    }
}

export default connectDB;

// 2^nd pattern : cache wala:
/* const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { DB_NAME: DB_NAME , bufferCommands: false })
  }.then((mongoose) => {
    return mongoose;
  }).catch((error) => {
    console.log("MONGODB connection failed", error);
    process.exit(1);
  });
  cached.conn = await cached.promise;
  console.log(`\n MongoDB connected || DB HOST: ${ cached.conn.connection.host }`);
  console.log(cached.conn.connection ? "MongoDB connection successful" : "MongoDB connection failed");
  return cached.conn;
};

 */
