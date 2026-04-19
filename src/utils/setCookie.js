import ms from "ms";

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
    maxAge: ms(process.env.ACCESS_TOKEN_EXPIRES_IN), // Cookie expires in 15 minutes
  });

  // 2. Set refreshToken in HTTP-only cookie:
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: ms(process.env.REFRESH_TOKEN_EXPIRES_IN), // Cookie expires in 7 days
  });
};

export const clearCookie = (res) => {

  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // secure cookies
    sameSite: isProduction ? "none" : "lax", // Prevent CSRF attacks
    path: "/", // Cookie is accessible on all routes
  };

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};

/*
If frontend runs on different domain:
frontend → app.example.com
backend → api.example.com
than:

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  domain: isProduction ? ".example.com" : undefined
};
*/