export const setCookie = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // secure cookies
    sameSite: isProduction ? "none" : "lax", // Prevent CSRF attacks
    path: "/", // Cookie is accessible on all routes
  };

  // 1. Set accessToken in HTTP-only cookie:
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // Cookie expires in 15 minutes
  });

  // 2. Set refreshToken in HTTP-only cookie:
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
  });
};
