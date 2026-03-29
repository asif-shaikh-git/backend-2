import mongoose, { Schema } from "mongoose";

const addressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    mobileNumber: {
      type: Number,
      required: [true, "Mobile number required"],
      trim: true,
      match: [
          /^[6-9]\d{9}$/,
          "Please enter a valid 10-digit Indian mobile number"
        ]
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: "india",
      lowercase: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);


export const Address = mongoose.model( "Address", addressSchema );

