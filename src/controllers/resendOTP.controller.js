import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { OTP } from "../models/OTP.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcrypt";
import { generateOTP } from "../utils/generateOTP.js";

export const resendOTP = asyncHandler(async (req, res, length = 6) => {
  const { userId } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(
      404,
      "User not found, for which the OTP has been generated"
    );
  }

  await OTP.deleteMany({ user: user._id });

  const otp = generateOTP();

  const hashedOtp = await bcrypt.hash(otp, 10);

  await OTP.create({
    user: user._id,
    otp: hashedOtp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
  });

  await sendEmail({
    receiverEmail: user.email,
    subject: "Resend OTP",
    body: `
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP expires in 5 minutes.</p>
    `,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      `Dear ${user.username}, OTP resent successfully to ${user.email} ✅.
            This OTP valid for 5 minute.`
    )
  );
});
