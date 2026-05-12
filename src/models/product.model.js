import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const productSchema = new Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
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
      min: [10, "Price of a Product can't be ZERO or NEGATIVE"],
    },
    category: {
      type: String,
      required: [true, "The Product must be put in desired Category"],
      lowercase: true,
      trim: true,
      index: true,
    },
    brandname: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    productImages: {
        type: [ String ], // cloudinary url
        validate: {
          validator: arr => arr.length >0,
          message: "At least one product image is required"
        }
      },
  
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
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
      required: true,
      refPath: "creatorModel",
    },
    creatorModel: {
      type: String,
      required: true,
      enum: ["Vendor", "Admin"],
    },
  },
  { timestamps: true }
);

productSchema.plugin(mongooseAggregatePaginate);

productSchema.index({ productname: "text", description: "text" });

export const Product = mongoose.model("Product", productSchema);
