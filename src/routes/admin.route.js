import { Router } from "express";
import { registerAdmin, loginAdmin, logoutAdmin, getAdminProfile,getAnyUserProfile, updateAdminProfile, deleteAdminProfile, uploadAdminAvatar, changeAdminPassword, forgotAdminPassword, resetAdminPassword } from "../controllers/admin.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/verifyAdminVendorCustomer.middleware.js";

const adminRouter = Router();

// auth:
adminRouter.post("/registerAd", upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), registerAdmin);
adminRouter.post("/loginAd", loginAdmin);
adminRouter.post("/logoutAd", verifyJwt, logoutAdmin);

// profile:
adminRouter.get("/profile", verifyJwt, getAdminProfile);
adminRouter.get("/profile", verifyJwt, verifyAdmin, getAnyUserProfile);
adminRouter.put("/profile", verifyJwt, updateAdminProfile);
adminRouter.delete("/profile", verifyJwt, deleteAdminProfile);
adminRouter.put("/profile/avatar", verifyJwt, uploadAdminAvatar);
adminRouter.patch("/profile/change-password", verifyJwt, changeAdminPassword);

// password recovery:
adminRouter.post("/forgot-password", forgotAdminPassword);
adminRouter.post("/reset-password", resetAdminPassword);

export default adminRouter;