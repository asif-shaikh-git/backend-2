import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration:
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    // Check if local file path is provided
    if ( !localFilePath ) return null;

    // Upload an image
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Delete the local file after upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return uploadResult;
  } catch (error) {
    // delete the local file if upload fails
    if ( localFilePath && fs.existsSync(localFilePath )) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

export default uploadOnCloudinary ;

/*
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    return null;
  }
};

export const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    return null;
  }
};

*/
