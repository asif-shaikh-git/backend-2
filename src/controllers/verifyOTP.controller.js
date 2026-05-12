import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { OTP } from "../models/OTP.model.js";
import bcrypt from "bcrypt";
import { sanitizeUser } from "../utils/SanitizeUser.js";

export const verifyOTP = asyncHandler(async (req, res) => {
  const { receiverEmail, otp } = req.body;
  if (!receiverEmail || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  const user = await User.findOne({ email: receiverEmail });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const existingOTP = await OTP.findOne({ user: user._id });
  if (!existingOTP) {
    throw new ApiError(400, "Invalid User");
  }

  const isValidOTP = await bcrypt.compare(otp, existingOTP.otp);

  if (!isValidOTP) {
    throw new ApiError(400, "Invalid OTP");
  }

  if (existingOTP.expiresAt < Date.now()) {
    await OTP.deleteMany({ user: user._id });
    throw new ApiError(400, "OTP expired");
  }

  await OTP.deleteMany({ user: user._id });

  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        sanitizeUser(user),
        `${receiverEmail}, OTP verified successfully ✅`
      )
    );
});
