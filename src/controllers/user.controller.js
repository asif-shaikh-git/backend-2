import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteFromCloudinary, deleteMultipleFromCloudinary } from "../utils/cloudinary.js";
import { setCookie, clearCookie } from "../utils/setCookie.js";
import { generateTokens } from "../utils/generateTokens.js";
import { getProfile, updateProfile, deleteProfile } from "./profile/profileHandlers.js";
import { updateAvatar } from "./avatar.controller.js";
import { changePassword, forgotPassword, resetPassword } from "./password/passwordHandlers.js";

// to register a new user:
export const registerUser = asyncHandler(async (req, res) => {
  // 1. Extract user details from request body:
  const { username, email, password, fullName, mobileNumber } = req.body;

  // 2. Validate required fields:
  if (
    [username, email, password, fullName, mobileNumber].some(
      (field) => typeof field !== "string" || !field.trim()
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 3. Check if user with same email, username or mobile number already exists:
  const existedUser = await User.findOne({
    $or: [{ email }, { username }, { mobileNumber }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      " User with same email, username or mobile number are already existed "
    );
  }

  // 4. BY USING Multer: req.files
  // Check for image / avatar in request files and upload to Cloudinary if exists:
  // Initialize avatarUrl to empty string in case no avatar is uploaded:
  // get avatar url if avatar image is uploaded in request:

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // if not exists:
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  // if exists:upload an image using Cloudinary:
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // if upload failed:
  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar image");
  }

  // similarly for cover image, if cover image is provided, upload it to Cloudinary and get the URL:
  // Makes cover image optional:
  let coverImage = null;

  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage) {
      throw new ApiError(500, "Failed to upload cover image");
    }
  }

  // extracting the HTTPS image URL:
  const avatarUrl = avatar.secure_url;
  const avatarPublicId = avatar.public_id;

  const coverImageUrl = coverImage ? coverImage.secure_url : null;
  const coverImagePublicId = coverImage ? coverImage.public_id : null;

  // 5. Create new user in database:
  const newUser = await User.create({
    username: username.toLowerCase(),
    email,
    mobileNumber,
    password,
    fullName,
    avatar: avatarUrl,
    avatarPublicId: avatarPublicId,
    coverImage: coverImageUrl,
    coverImagePublicId: coverImagePublicId,
  });

  // 6. remove password and refresh token from user object before sending response:
  // const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
  // or to remove unnecessary DB query after user creation and saves one DB hit:
  const createdUser = newUser.toSafeObject();

  // 7. check User creation success:
  if (!newUser) {
    throw new ApiError(500, "Failed to create user");
  }

  // 8. Delete local files after upload to Cloudinary:
  // we write local file deletion logic in ../utils/cloudinary.js.
  // therefore we donnot write it again here:
  /*
  if (avatarLocalPath) {
    // Delete the local avatar file
    await deleteLocalFile(avatarLocalPath);
  }

  if (coverImageLocalPath) {
    // Delete the local cover image file
    await deleteLocalFile(coverImageLocalPath);
  }
  */

  // 9. Generate JWT token for the user:
  // userSchema.methods.generateAccessToken = function () { ... };
  // in user.model.js we pass function () with no parameters. therefore do not write like this:
  // const accessToken = user.generateAccessToken( { userId: user._id, role: user.role } );
  // const refreshToken = user.generateRefreshToken( { userId: user._id, role: user.role } );
  
  // function generateTokens() definds in generateTokens.js file :
  const { accessToken, refreshToken } = await generateTokens(newUser, req);

  // 10. Save refreshToken in database for the user:
  // Note: we cannot save accessToken in database
  // because it is short-lived and will be stored in HTTP-only cookie,
  // but we need to save refresh token in database to validate it
  // during token refresh and logout:
  // user.refreshToken = refreshToken;
  // instead of saving refresh token directly in database,
  //  we will hash it before saving for better security:
  // user.refreshTokens = await bcrypt.hash(refreshToken, 10);

  // 12. Set accessToken in HTTP-only cookie:
  // Note: We set accessToken and also refreshToken in HTTP-only cookies,
  // but only refreshToken will be stored in database for validation.
  /*res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true, // secure cookies 
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: 15 * 60 * 1000, // Cookie expires in 15 minutes
  });

  // 13. Set refreshToken in HTTP-only cookie:
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true, // secure cookies 
    sameSite: "strict", // Prevent CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expires in 7 days
  });
  */
  // instead of writing cookie setting logic here, we will write it in a separate utility function for better code organization and reusability:
  
  // function setCookie() definds in setCookie.js file :
  setCookie(res, accessToken, refreshToken);

  // 14. Send success response with user data (excluding sensitive info):
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
    // 1. Extract email and password from request body:
    const { email, mobileNumber, password } = req.body;

    // 2. Validate required fields:
    if (!password || (!email && !mobileNumber)) {
      throw new ApiError(
        400,
        "Email or mobile number and password are required"
      );
    }

    // 3. Find user by email or mobile number:
    const user = await User.findOne({
      $or: [{ email }, { mobileNumber }],
    }).select("+password +refreshTokens");

    if (!user || !(await user.isPasswordCorrect(password))) {
      throw new ApiError(401, "Invalid credentials");
    }

    // 5. Generate new access token and refresh token:
    /*const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    
    // 6. Hash the new refresh token and save it in database:
    user.refreshToken = await bcrypt.hash( refreshToken, 10 );
    await user.save({ validateBeforeSave: false });
    */

    // run cleanupRefreshTokens() function -- expired sessions removed :
    const cleanupResult = await user.cleanupRefreshTokens();
    if (cleanupResult.expiredSessionsRemoved) {
      await user.save({ validateBeforeSave: false });
    }

    // instead of writing step 5 - token generation and step 6 - saving logic here,
    // we will write it in a separate utility function for better code organization and reusability:
    const { accessToken, refreshToken } = await generateTokens(user, req);

    // 7. Set access token and refresh token in HTTP-only cookies:
    setCookie(res, accessToken, refreshToken);

    // 8. Send success response with user data (excluding sensitive info):
    const userData = user.toSafeObject();

    return res
      .status(200)
      .json(new ApiResponse(200, userData, "User logged in successfully"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user || !req.cookies?.refreshToken) {
    throw new ApiError(400, "Invalid logout request");
  }

  // 1. Get user from request (set by auth middleware):
  const user = req.user;

  // 2. Get refresh token from cookies:
  const refreshTokenFromCookie = req.cookies.refreshToken;
  if (!refreshTokenFromCookie) {
    throw new ApiError(401, "Refresh token missing");
  }

  // remove expired session first :
  // function cleanupRefreshTokens() definds in in commonAuth.model.js as attachSessionMethods().
  const cleanupResult = await user.cleanupRefreshTokens(); 
  if (cleanupResult.expiredSessionsRemoved) {
    await user.save({ validateBeforeSave: false });
  } 

  // remove current device session :
  // function removeRefreshToken() definds in commonAuth.model.js as attachSessionMethods().

  const result = await user.removeRefreshToken(refreshTokenFromCookie);  
  
  if (result.sessionRemoved) {
    await user.save({ validateBeforeSave: false });
  }

  // 3. Clear access token and refresh token cookies: 
  // function clearCookie() definds in setCookie.js file :
  clearCookie(res);

  // 4. Send success response:
  return res
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

export const getUserProfile = getProfile(User, "user");

export const getAnyUserProfile = getProfile(User, "admin", true);

export const updateUserProfile = updateProfile(User, "user", [
  "username",
  "email",  
  "mobileNumber",
  "fullName",
]);

export const deleteUserProfile = deleteProfile(User, "user");

export const updateUserAvatar = updateAvatar(User, "user");

export const changeUserPassword = changePassword(User, "user");

export const forgotUserPassword = forgotPassword(User, "user");

export const resetUserPassword = resetPassword(User, "user");


