import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Vendor } from "../models/vendor.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { setCookie, clearCookie } from "../utils/setCookie.js";
import { generateTokens } from "../utils/generateTokens.js";
import { getProfile, updateProfile, deleteProfile } from "./profile/profileHandlers.js";
import { updateAvatar } from "./avatar.controller.js";
import { changePassword, forgotPassword, resetPassword } from "./password/passwordHandlers.js";

export const registerVendor = asyncHandler(async (req, res) => {
    const { username, shopName, gstNumber, storeDetails, aadharCard, panNumber, email, password, mobileNumber } = req.body;
    if (
        [username, shopName, gstNumber, storeDetails, aadharCard, panNumber, email, password, mobileNumber].some(
            (field) => typeof field !== "string" || !field.trim()
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }
    const existedVendor = await Vendor.findOne({
        $or: [{ gstNumber }, { aadharCard }, { panNumber }, { email }, { username }, { mobileNumber }],
    });
    if (existedVendor) {
        throw new ApiError(
            409,
            " Vendor with same gstNumber, aadharCard, panNumber, email, username or mobile number are already existed "
        );
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar image is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar image");
    }

    let coverImage = null;

    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if (!coverImage) {
            throw new ApiError(500, "Failed to upload cover image");
        }
    }

    const avatarUrl = avatar.secure_url;
    const avatarPublicId = avatar.public_id;
    const coverImageUrl = coverImage ? coverImage.secure_url : null;
    const coverImagePublicId = coverImage ? coverImage.public_id : null;

    const newVendor = await Vendor.create({
        username,
        shopName,
        gstNumber,
        storeDetails,
        aadharCard,
        panNumber,
        email,
        password,
        mobileNumber,
        avatar: avatarUrl,  
        avatarPublicId: avatarPublicId,
        coverImage: coverImageUrl,
        coverImagePublicId: coverImagePublicId,
    });

    const createdVendor = newVendor.toSafeObject();

    if (!newVendor) {
        throw new ApiError(500, "Failed to register vendor");
    }


    const { accessToken, refreshToken } = await generateTokens(newVendor, req);

    setCookie(res, accessToken, refreshToken);

    returnres
    .status(201)
    .json(new ApiResponse(201, createdVendor, "Vendor registered successfully"));
});


export const loginVendor = asyncHandler(async (req, res) => {
    const { vendorId, email, mobileNumber, password } = req.body;

    if (!password || (!email && !mobileNumber && !vendorId)) {
        throw new ApiError(400, "Email, mobile number, vendor ID, and password are required");
    }
    
    const vendor = await Vendor.findOne({
        $or: [{ email }, { mobileNumber }, { vendorId }]
    }).select("+password +refreshTokens");

    if (!vendor || !(await vendor.isPasswordCorrect(password))) {
        throw new ApiError(401, "Invalid credentials");
    }

    const cleanupResult = await vendor.cleanupRefreshTokens();
    if (cleanupResult.expiredSessionsRemoved) {
        await vendor.save({ validateBeforeSave: false });
    }

    const { accessToken, refreshToken } = await generateTokens(vendor, req);

    setCookie(res, accessToken, refreshToken);

    const vendorData = vendor.toSafeObject();
    
    return res
    .status(200)
    .json(new ApiResponse(200, vendorData, "Vendor logged in successfully"));
}
);

export const logoutVendor = asyncHandler(async (req, res) => {
  if (!req.vendor || !req.cookies?.refreshToken) {
    throw new ApiError(400, "Invalid logout request");
  }

  // 1. Get vendor from request (set by auth middleware):
  const vendor = req.vendor;

  // 2. Get refresh token from cookies:
  const refreshTokenFromCookie = req.cookies.refreshToken;
  if (!refreshTokenFromCookie) {
    throw new ApiError(401, "Refresh token missing");
  }

  // remove expired session first :
  // function cleanupRefreshTokens() definds in in commonAuth.model.js as attachSessionMethods().
  const cleanupResult = await vendor.cleanupRefreshTokens(); 
  if (cleanupResult.expiredSessionsRemoved) {
    await vendor.save({ validateBeforeSave: false });
  } 

  // remove current device session :
  // function removeRefreshToken() definds in commonAuth.model.js as attachSessionMethods().

  const result = await vendor.removeRefreshToken(refreshTokenFromCookie);  
  if (result.sessionRemoved) {
    await vendor.save({ validateBeforeSave: false });
  }

  // 3. Clear access token and refresh token cookies: 
  // function clearCookie() definds in setCookie.js file :
  clearCookie(res);

  // 4. Send success response:
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Vendor logged out successfully"));
});

export const getVendorProfile = getProfile(Vendor, "vendor");

export const getAnyVendorProfile = getProfile(Vendor, "admin", true);

export const updateVendorProfile = updateProfile(Vendor, "vendor", [
    "username",
    "email",
    "mobileNumber",
    "fullName",
]);

export const deleteVendorProfile = deleteProfile(Vendor, "vendor");
export const updateVendorAvatar = updateAvatar(Vendor, "vendor");
export const changeVendorPassword = changePassword(Vendor, "vendor");
export const forgotVendorPassword = forgotPassword(Vendor, "vendor");
export const resetVendorPassword = resetPassword(Vendor, "vendor");


