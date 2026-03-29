import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    productname: {
      type: String,
      required: [true, "Product name is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Add Product description"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Provide Price of Product"],
      min: [0, "Price of a Product can't be ZERO or NEGATIVE"],
    },
    category: {
      type: String,
      required: [true, "The Product must be put in desired Category"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    brandname: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    productImages: [
      {
        type: String, // cloudinary url
      },
    ],
    ratings: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
