import { Router } from "express";
import { registerAdmin, loginAdmin, logoutAdmin } from "../controllers/admin.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const adminRouter = Router();
adminRouter.post("/registerAd", registerAdmin);
adminRouter.post("/loginAd", loginAdmin);
adminRouter.post("/logoutAd", verifyJwt, logoutAdmin);

export default adminRouter;