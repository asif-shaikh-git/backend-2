import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { OTP } from "../models/OTP.model.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendEmail } from "../utils/sendEmail.js";

export const sendOTP = asyncHandler(async (req, res) => {
  const { receiverEmail } = req.body;

  if (!receiverEmail) {
    throw new ApiError(
      400,
      "Email are required."
    );
  }

  const user = await User.findOne({ email: receiverEmail });

  if(!user) {
    throw new ApiError(404, "User not found with this email");
  }

  const otp = generateOTP();

  await OTP.deleteMany({ user: user._id });

  const hashedOtp = await bcrypt.hash(otp, 10);

  await OTP.create({
    user: user._id,
    otp: hashedOtp,
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  await sendEmail({
    receiverEmail: user.email,
    subject: "OTP Verification",
    body: `
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP expires in 10 minutes.</p>
    `,

});

return res.status(200).json(
    new ApiResponse(
      200,
      {},
      `OTP sent successfully to ${receiverEmail} 📩.
          This OTP is valid for 10 minutes.`
    )
  );

});
