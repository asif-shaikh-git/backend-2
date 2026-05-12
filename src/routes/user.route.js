import { Router } from "express";
import { registerUser, loginUser, logoutUser,  getUserProfile, updateUserProfile, deleteUserProfile, updateUserAvatar, changeUserPassword, forgotUserPassword, resetUserPassword } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const userRouter = Router();

// auth:
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/logout", verifyJwt, logoutUser);

// profile:
userRouter.get("/profile", verifyJwt, getUserProfile);
userRouter.put("/profile", verifyJwt, updateUserProfile);
userRouter.delete("/profile", verifyJwt, deleteUserProfile);
userRouter.patch("/profile/avatar", verifyJwt, updateUserAvatar);
userRouter.patch("/profile/change-password", verifyJwt, changeUserPassword);

// password recovery:
userRouter.post("/forgot-password", forgotUserPassword);
userRouter.post("/reset-password", resetUserPassword);

export default userRouter;


// userRouter.route( "/register" ).post(registerUser);
//userRouter.route("/login").post(loginUser);
//userRouter.route("/logout").post(verifyJwt, logoutUser);
