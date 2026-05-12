//import mongoose from "mongoose";
//import { DB_NAME } from "./constants.js";

/* 1^ approach: ALL CODE IN ONE PLACE , NOT RECOMMENDED FOR PRODUCTION 
    BUT GOOD FOR LEARNING PURPOSES AND SMALL PROJECTS 
    USE IIFE TO AVOID TOP-LEVEL AWAIT AND KEEP THE CODE ORGANIZED
    DB WITH try catch (error)
*/

/*
;( async () => {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        app.on("error", (err) => {
            console.error("Error starting server:", err);
            process.exit(1);
        });
        app.listen(process.env.PORT || 8000, () => {
            console.log(`App is listening on port ${process.env.PORT || 8000}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);    
    }
})();
*/


/* 2^ approach: SEPARATE DB CONNECTION AND SERVER STARTUP INTO DIFFERENT FILES
    THIS APPROACH IS MORE MODULAR AND SCALABLE, RECOMMENDED FOR PRODUCTION 
    USE A SEPARATE FILE FOR DB CONNECTION (e.g., db/index.js) AND ANOTHER FOR SERVER STARTUP (e.g., src/index.js)
    DB CONNECTION WITH try catch (error) IN db/index.js AND SERVER STARTUP IN src/index.js
    SEE src/db/index.js FOR DB CONNECTION IMPLEMENTATION
*/
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env"
});

const app = express();
connectDB()
.then(() => {
    const server = app.listen(process.env.PORT || 8000, () => {
        console.log(`App is listening on port: ${process.env.PORT || 8000}`);
    });
    server.on("error", (err) => {
        console.log("Failed to start server", err);
        process.exit(1);
    });
})
.catch((error) => {
    console.log("Failed to connect to MongoDB", error);
    process.exit(1);
});