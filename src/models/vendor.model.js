import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";

const vendorSchema = new Schema(
  {
    shopName: {
      type: String,
      required: true,
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    products: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    default: [],
  },
  }
);

vendorSchema.virtual("isVerified").get(function () {
  return this.isEmailVerified && this.isMobileVerified;
});

export const Vendor = User.discriminator( "Vendor", vendorSchema );

/* store management
bank details
tax info
KYC docs
product inventory
payouts
analytics
*/ 
