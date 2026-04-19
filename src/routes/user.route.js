import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const userRouter = Router();
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", verifyJwt, logoutUser);

export default userRouter;


// userRouter.route( "/register" ).post(registerUser);
//userRouter.route("/login").post(loginUser);
//userRouter.route("/logout").post(verifyJwt, logoutUser);
