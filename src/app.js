import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user.route.js";
import adminRouter from "./routes/admin.route.js";
import vendorRouter from "./routes/vendor.route.js";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// if frontend req. come in json format:
app.use(express.json({ limit: "16kb" }));

// if frontend req. come in +, 20%, ? etc added in url:
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// if frontend req. come in image, file, pdf format:
app.use(express.static("public"));

app.use(cookieParser());

app.use( "/api/v1/users", userRouter );
app.use( "/api/v1/admin", adminRouter );
app.use( "/api/v1/vendors", vendorRouter );

export { app };
