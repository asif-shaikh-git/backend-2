export const updateAvatar = (Model, reqKey) => {
  return asyncHandler(async (req, res) => {
    // 1. Get login user/admin/vendor from request
    // (set by auth middleware):
    const user = req[reqKey]; // req.user = user;

    if (!user || !user._id) {
      throw new ApiError(401, "Unauthorized");
    }

    // 2. Get the avatar image file from the request
    //  (set by multer middleware):

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
     
    // Prepare the update data object with the new avatar URL
    //  and optionally the cover image URL:
    const updateData = {
      avatar: avatar.secure_url,
    }; 


    // similarly for cover image, if cover image is provided,
    //  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    // upload it to Cloudinary and get the URL:
    // Makes cover image optional:

    if (coverImageLocalPath) {
      coverImage = await uploadOnCloudinary(coverImageLocalPath);

      if (!coverImage) {
        throw new ApiError(500, "Failed to upload cover image");
      }
       // Prepare the update data object with the optionally for new cover image URL:
        updateData.coverImage = coverImage.secure_url;
    }
   
    // 3. Update the user's avatar field in the database with the new image URL:
    const updatedUser = await Model.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      { new: true }
    );  

    if (!updatedUser) {
      throw new ApiError(500, "Failed to update user avatar");
    }

    // 4. Return the updated user data in the response:
    res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      data: updatedUser,
    });

  });
};
