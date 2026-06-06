import asyncHandler from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import upload from "../middlewares/multer.middleware.js";
import { uploadOnCloudinary, deleteFromCloudinary, deleteMultipleFromCloudinary } from "../utils/cloudinary.js";

export const createProduct = asyncHandler(async (req, res) => {
    const {
        productId,
        productname,
        description,
        price,
        category,
        brandname,
        stock,
        productImages,
        productVariants,
        discount,
        rating,
        numOfReviews,
        isFeatured,
        createdBy,
        creatorModel
    } = req.body;
});

// Validate required fields
if (!productId || !productname || !description || !price || !category || !brandname || !stock || !createdBy || !creatorModel) {
    throw new ApiError(400, "Missing required fields");
}   


// Handle file uploads
const imagePaths = [];
if (req.files) {
    req.files.forEach(file => {
        imagePaths.push(file.path);
    });
}

const productImages = productImages ? productImages.split(",").map(img => img.trim()) : [];
imagePaths.push(...productImages);

const uniqueImagePaths = [...new Set(imagePaths)];

const finalImagePaths = uniqueImagePaths.length > 0 ? uniqueImagePaths : undefined;

const productImagesUrls = await uploadOnCloudinary(finalImagePaths);

if (productImagesUrls.length === 0) {
    throw new ApiError(400, "At least one product image is required");
}

const productUrls = productImagesUrls.map(url => url.secure_url);

const allowedCreatorModels = ["Vendor", "Admin"];
if (!allowedCreatorModels.includes(creatorModel)) {
    throw new ApiError(400, "Invalid creator model");
}

// Create the product
const product = new Product({
    productId,
    productname,
    description,
    price,
    category,
    brandname,
    stock,
    productImages: productUrls,
    productVariants,
    discount,
    rating,
    numOfReviews,
    isFeatured,
    createdBy,
    creatorModel
}); 

await product.save();

res.status(201).json(new ApiResponse(201, product, "Product created successfully"));


