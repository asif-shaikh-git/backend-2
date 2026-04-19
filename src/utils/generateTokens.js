import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import asyncHandler from "express-async-handler";
import ms from "ms";


export const generateTokens = asyncHandler(async (user, req) => {
  
  // Generate access token and refresh token using user instance methods:
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  const sessionId = nanoid();

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  // Hash the refresh token and save it in the database:
  user.refreshTokens.push({
    token: hashedRefreshToken,
    sessionId,
    device: req.headers["user-agent"] || "Unknown",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
    expiresAt: new Date(Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRES_IN)), // Set expiration for refresh token (7 days)
  });

  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken, sessionId };
});

// 10. Save refreshToken in database for the user:
// Note: we cannot save accessToken in database
// because it is short-lived and will be stored in HTTP-only cookie,
// but we need to save refresh token in database to validate it
// during token refresh and logout:
// user.refreshToken = refreshToken;
// instead of saving refresh token directly in database,
//  we will hash it before saving for better security:
// user.refreshTokens = await bcrypt.hash(refreshToken, 10);
