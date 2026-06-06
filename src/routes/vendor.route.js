import { Router } from "express";
import { registerVendor, loginVendor, logoutVendor,  getVendorProfile, updateVendorProfile, deleteVendorProfile, updateVendorAvatar, changeVendorPassword, forgotVendorPassword, resetVendorPassword } from "../controllers/vendor.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { verifyVendor } from "../middlewares/verifyAdminVendorCustomer.middleware.js";

const vendorRouter = Router();

// auth:
vendorRouter.post("/register", upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]), registerVendor);
vendorRouter.post("/login", loginVendor);
vendorRouter.post("/logout", verifyJwt, logoutVendor);

// profile:
vendorRouter.get("/profile", verifyJwt, verifyVendor, getVendorProfile);
vendorRouter.put("/profile", verifyJwt, updateVendorProfile);
vendorRouter.delete("/profile", verifyJwt, deleteVendorProfile);
vendorRouter.patch("/profile/avatar", verifyJwt, updateVendorAvatar);
vendorRouter.patch("/profile/change-password", verifyJwt, changeVendorPassword);

// password recovery:
vendorRouter.post("/forgot-password", forgotVendorPassword);
vendorRouter.post("/reset-password", resetVendorPassword);

export default vendorRouter;