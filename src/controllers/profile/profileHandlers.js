
// 1. Get profile handler:
export const getProfile = (reqKey, role) => {
  return asyncHandler(async (req, res) => {

   // 1. Get login user/admin/vendor from request (set by auth middleware):
    const user = req[reqKey]; // req.user = user;

    if (!user) {
        throw new ApiError(404, `${role} not found`);
    }

    // 2. Send success response with user profile data:
    res
      .status(200)
      .json(new ApiResponse(200, user, `${role} profile retrieved successfully`));
  }
    );
};

// 2. Update profile handler:
export const updateProfile = (Model, reqKey, allowedFields) => {
  return asyncHandler(async (req, res) => {

    // 1. Get login user/admin/vendor from request (set by auth middleware):
    const user = req[reqKey]; // req.user = user;

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Get the ID of the entity being updated (user or admin or vendor):
    const userId = user._id;

    // Extract updated profile details from request body:
    const updates = req.body;

    const UNIQUE_FIELDS = ["username", "email", "mobileNumber", "fullName"];

    const checkedFields = async (field, value) => {
        if (!value || user[field] === value) return;

        const exists = await Model.exists({
          [field]: value,
          _id: { $ne: userId },
        });
        if (exists) {
            throw new ApiError(
                409,
                `A ${Model.modelName.toLowerCase()} with the same ${field} already exists`
            );
        }

       // Update the field in the entity:
        user[field] = value;
    };

    for (const field of allowedFields) {

        const value = updates[field];

        if (value === undefined) continue;

        if (UNIQUE_FIELDS.includes(field)) {
            await checkedFields(
                field,
                typeof value === "string" ? value.trim().toLowerCase() : value
            );
        } else {
            user[field] = value;
        }
        }

        // Save the updated user to the database:
        await user.save();

        // Send the updated profile in the response:
        res.status(200).json({
            success: true,
            message: `${Model.modelName} profile updated successfully`,
            [Model.modelName.toLowerCase()]: user,
        });
  });
};

// 3. Delete profile handler:
export const deleteProfile = (Model, reqKey, role) => {
  return asyncHandler(async (req, res) => {
    // Implementation for deleting profile
    
    // 1. Get login user/admin/vendor from request (set by auth middleware):
    const user = req[reqKey]; // req.user = user;
    if (!user) {
        throw new ApiError(404, `${role} not found`);
    }
    
    // 2. Delete the user profile from the database:
    const deletedUser = await Model.findByIdAndDelete(user._id);

    if (!deletedUser) {
        throw new ApiError(500, `Failed to delete ${role} profile`);
    }

    // 3. Send success response:
    res
        .status(200)
        .json(new ApiResponse(200, null, `${role} profile deleted successfully`));
    });
};
