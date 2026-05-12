import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

export const updateAvatar = (Model, reqKey) => {
  return asyncHandler(async (req, res) => {
    // 1. Get login user/admin/vendor from request
    // (set by auth middleware):
    // req[reqKey] = req.user/req.admin/req.vendor
    const user = req[reqKey]; 

    if (!user?._id) {
      throw new ApiError(401, "Unauthorized");
    }

    // 2. Get the avatar image file from the request
    //  (set by multer middleware):

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // if not exists:
    if (!avatarLocalPath && !coverImageLocalPath) {
      throw new ApiError(400, "At least one image is required");
    }
    
    const updateData = {};

    // FOR AVATAR:
    // if exists:upload an image using Cloudinary:
    if (avatarLocalPath) {
      const newAvatar = await uploadOnCloudinary(avatarLocalPath);
     
      // if upload failed:
      if (!newAvatar) {
      throw new ApiError(500, "Failed to upload avatar image");
    }
     
    // update data object with the newAvatar.secure_url, and newAvatar.public_id :
    updateData.file = {
      url: newAvatar.secure_url,
      public_id: newAvatar.public_id,
      resourceType: newAvatar.resource_type
    };
    }
    
    // FOR COVERIMAGE:
    // if exists:upload an image using Cloudinary:
    if (coverImageLocalPath) {
      const newCoverImage = await uploadOnCloudinary(coverImageLocalPath);
     
      // if upload failed:
      if (!newCoverImage) {
      throw new ApiError(500, "Failed to upload cover image");
    }
     
    // update data object with the newAvatar.secure_url, and newAvatar.public_id :
    updateData.file = {
      url: newCoverImage.secure_url,
      public_id: newCoverImage.public_id,
      resourceType: newCoverImage.resource_type
    };
    }

    // 3. Update the user's avatar field in the database with the new image URL:
    const updatedUser = await Model.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password -refreshTokens"); // Exclude sensitive fields

    if (!updatedUser) {
      throw new ApiError(500, "Failed to update user images");
    }
    
    try {
    if (avatarLocalPath && user.avatarPublicId) {
      await deleteFromCloudinary(
        file.public_id,
        file.resourceType
      );
    }

    if (coverImageLocalPath && user.coverImagePublicId) {
      await deleteFromCloudinary(
        file.public_id,
        file.resourceType
      );
    }
  } catch (error) {
    console.error("Cloudinary cleanup failed", error);
  }

    // 4. Return the updated user data in the response:
    return res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      data: updatedUser,
    });

  });
};
