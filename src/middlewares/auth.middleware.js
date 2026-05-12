import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

// To check who is login : user/admin/vendor
export const verifyJwt = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer", "");

  if (!token) {
    throw new ApiError(401, "No Token");
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decodedToken?._id).select(
    "-password -refreshTokens"
  );

  if (!user) {
    throw new ApiError(401, "Invalid Access Token");
  }

  //send login user/admin/vendor from request:
  req.user = user;

  // Role-based assignment :
  switch (user.accountType) {
    case "Admin":
      req.admin = user;
      break;

    case "Vendor":
      req.vendor = user;
      break;

    case "Customer":
      req.customer = user;
      break;

    default:
      throw new ApiError(403, "Invalid account type");
  }

  next();
});
