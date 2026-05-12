import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { generateToken } from "../../utils/generateTokens.js";
import { sanitizeUser } from "../../utils/SanitizeUser.js";
import PasswordResetToken from "../../models/passwordResetToken.model.js";
import bcrypt from "bcrypt";
import { sendEmail } from "../../utils/sendMail.js";

export const changePassword = (Model, reqKey) => {
  return asyncHandler(async (req, res) => {
    // 1. Get login user/admin/vendor from request
    // (set by auth middleware):
    // req[reqKey] = req.user/req.admin/req.vendor based on the reqKey passed to this function.;
    const user = req[reqKey];

    if (!user || !user._id) {
      throw new ApiError(401, "Unauthorized");
    }

    // 2. Get current password and new password from request body:
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "Current password and new password are required");
    }

    if (currentPassword === newPassword) {
      throw new ApiError(
        400,
        "New password cannot be the same as current password"
      );
    }

    // 3. Verify current password:
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(401, "Current password is incorrect");
    }

    // 4. Update password and save user:
    user.password = newPassword;

    // for set newPassword, logout all sessions:
    user.refreshTokens = [];
    user.tokenVersion += 1;

    await user.save();

    // 5. Send success response:
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          `Dear ${user.username}, your password has been changed successfully`
        )
      );
  });
};

export const forgotPassword = (Model, reqKey) => {
  return asyncHandler(async (req, res) => {
    let newToken;
    
    // 1. Check if user with the provided email exists or not:

    const isExistingUser = await Model.findOne({ email: req.body.email });
    if (!isExistingUser) {
      throw new ApiError(
        404,
        "User with this email does not exist"
      );
    }

    await PasswordResetToken.deleteMany({
       userId: isExistingUser._id 
      });

    // 2. If user exists, generate a password reset token:
    const passwordResetToken = generateToken(
      sanitizeUser(isExistingUser),
      true
    );

    // 3. hash the token before saving to database for security reasons:

    const hashedToken = await bcrypt.hash(passwordResetToken, 10);

    newToken = new PasswordResetToken({
      userId: isExistingUser._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 3600000), // Token expires in 1 hour
    });
    await newToken.save();

    // 3. Send the token to user's email :
    await sendEmail(
      isExistingUser.email,
      { token: passwordResetToken },
      "Password Reset Link for Your Account",
      `<p>Dear ${isExistingUser.username},

        We received a request to reset the password for your account. If you initiated this request, please use the following link to reset your password:</p>
        
        <p><a href=${process.env.ORIGIN}/reset-password/${isExistingUser._id}/${passwordResetToken} target="_blank">Reset Password</a></p>
        
        <p>This link is valid for a limited time. If you did not request a password reset, please ignore this email. Your account security is important to us.
        
        Thank you,
        The DIWAAN GROUP</p>`
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          `Password reset token sent to ${isExistingUser.email}`
        )
      );
  });
};

export const resetPassword = (Model) => {
  return asyncHandler(async (req, res) => {

    const { userId, token, password } = req.body;

    if(!userId || !token || !password) {
      throw new ApiError(400, "Missing required fields");
    }

    const isExistingUser = await Model.findById(userId).select("+password");

    if(!isExistingUser) {
      throw new ApiError(404, "User does not exists");
    }

    // 1. Validate the token:
    const isResetTokenExisting = await PasswordResetToken.findOne({
      userId: isExistingUser._id
    });

    if (!isResetTokenExisting) {
      throw new ApiError(400, "To Reset Password - User does not found");
    }

    // 2. If token is valid, update the user's password:
    if (isResetTokenExisting.expiresAt < new Date()) {
      await PasswordResetToken.findByIdAndDelete(isResetTokenExisting._id);
      throw new ApiError(400, "Reset link has expired.");
    }
    
    const isValidToken = await bcrypt.compare(token, isResetTokenExisting.token);

    if(!isValidToken) {
      throw new ApiError(400, "Invalid reset token");
    }
      
    isExistingUser.password = password;
    isExistingUser.refreshTokens =[];
    isExistingUser.tokenVersion += 1;

    await Model.findByIdAndUpdate(isExistingUser._id, {
        password: await bcrypt.hash(password, 10),
      });

    await PasswordResetToken.findByIdAndDelete(isResetTokenExisting._id);
     
      return res.status(200).json( new ApiResponse (200, null, "Password Updated Successfuly" ));
  });  
 };