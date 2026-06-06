import asyncHandler from "../utils/asyncHandler.js";
import { Address } from "../models/address.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a new address
export const createAddress = asyncHandler(async (req, res) => {
  const {
    fullName,
    mobileNumber,
    addressLine1,
    addressLine2,
    city,
    district,
    state,
    postalCode,
    country,
    isDefault,
  } = req.body;

  if (!fullName || !mobileNumber || !addressLine1 || !city || !district || !state || !postalCode) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // If this is the first address for the user, 
  // set it as default regardless of the isDefault value provided
  const existingAddressCount = await Address.countDocuments({ user: user._id });

  const defaultStatus = existingAddressCount === 0 ? true : isDefault;

  // If the new address is set as default, unset the default status of existing addresses
  if (defaultStatus) {
    await Address.updateMany({ user: user._id }, { $set: { isDefault: false } });
  }

  const address = await Address.create({
    addressId: new mongoose.Types.ObjectId().toString(),
    user: user._id,
    fullName,
    mobileNumber,
    addressLine1,
    addressLine2,
    city,
    district,
    state,
    postalCode,
    country,
    isDefault: defaultStatus,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, address, "Address created successfully"));
});

// Get Address by ID:
export const getAddressById  = asyncHandler(async (req, res) => {

  const { addressId } = req.params;
  const address = await Address.findOne({_id: addressId, user: req.user._id, isDefault: true, }).lean();

 if (!address) {
    throw new ApiError(404, "No addresses found for this user");
  }

  return res
   .status(200)
   .json(new ApiResponse(200, address, "Address fetched successfully"));

});

// Get Default Address + All Addresses Together :

export const getDefaultAndAllAddresses = asyncHandler(async (req, res) => {
  const allAddresses = await Address.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  if (allAddresses.length === 0) {
    throw new ApiError(404, "No addresses found for this user");
  } 
  const defaultAddress = allAddresses.find((address) => address.isDefault) ?? null;

  return res
  .status(200)
  .json(new ApiResponse(200, { defaultAddress, allAddresses }, "Addresses fetched successfully"));

});

export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = await Address.findOne({_id: addressId, user: req.user._id, });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }
  
  if (req.body.isDefault === true) {
    await Address.updateMany({ user: req.user._id }, { $set: { isDefault: false}});
  }

  Object.assign(address, req.body);
  await address.save();

  return res
    .status(200)
    .json(new ApiResponse(200, address, "Address updated successfully"));
});


export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = await Address.findOneAndDelete({ _id: addressId, user: req.user._id });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Address deleted successfully"));

});
