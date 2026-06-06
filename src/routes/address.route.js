import { Router } from "express";
import { createAddress, getAddressById, getDefaultAndAllAddresses, updateAddress, deleteAddress } from "../controllers/address.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const addressRouter = Router();

addressRouter.post("/", verifyJwt, createAddress);
addressRouter.get("/:addressId", verifyJwt, getAddressById);
addressRouter.get("/", verifyJwt, getDefaultAndAllAddresses);
addressRouter.put("/:addressId", verifyJwt, updateAddress);
addressRouter.delete("/:addressId", verifyJwt, deleteAddress);

export default addressRouter;
