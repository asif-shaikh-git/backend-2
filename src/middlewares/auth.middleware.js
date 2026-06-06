import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";

// To check who is login : user/admin/vendor
export const verifyJwt = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.split(" ")[1]; // Expecting "Bearer <token>" format in Authorization header

  if (!token) {
    throw new ApiError(401, "No Token");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or Expired Access Token");
  }

  if (!decodedToken || !decodedToken._id || !decodedToken.accountType) {
    throw new ApiError(401, "Invalid Access Token");
  }

  let account = await User.findById(decodedToken?._id)
  .select("-password -refreshTokens");

  if (!account) {
    // If not found in User collection, check in Admin collection:
    account = await Admin.findById(decodedToken?._id)
    .select("-password -refreshTokens");
  } 

  if (!account) {
    throw new ApiError(401, "your account is not in User or Admin collection");
  }

 if (decodedToken.tokenVersion !== undefined && account.tokenVersion !== decodedToken.tokenVersion) {
    // Check token version for token invalidation (e.g., after password change):
    throw new ApiError(401, "Token has been invalidated. Please log in again.");
  }

  //send login user/admin/vendor from request:
  req.user = account;

  // Role-based assignment :
  switch (account.accountType) {
    case "Admin":
      req.admin = account;
      break;

    case "Vendor":
      req.vendor = account;
      break;

    case "Customer":
      req.customer = account;
      break;

    default:
      throw new ApiError(403, "Invalid account type");
  }

  next();
});
