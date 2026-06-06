import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";

const vendorSchema = new Schema(
  {
    shopName: {
      type: String,
      required: true,
    },
    vendorId: {
      type: String,
      unique: true,
      required: true,
    },
    vendorStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    approvedAt: Date,
    gstNumber: {
      type: String,
      match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      trim: true,
      uppercase: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    storeDetails: {
      address: String,
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: {
        type: String,
        uppercase: true,
        match: /^[A-Z]{4}0[A-Z0-9]{6}$/,
      },
      bankName: String,
    },
    taxInfo: {
      panNumber: String,
    },
    kycDocs: {
      aadharCard: {
        url: String,
        publicId: String,
      },
      panNumber: {
        type: String,
        uppercase: true,
        match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      },
      businessLicense: {
        url: String,
        publicId: String,
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

vendorSchema.virtual("isVerified").get(function () {
  return this.isEmailVerified && this.isMobileVerified;
});

vendorSchema.methods.toSafeObject = function () {
  const vendorObject = this.toObject();
  delete vendorObject.password;
  delete vendorObject.refreshTokens;
  return vendorObject;
};

export const Vendor = User.discriminator("Vendor", vendorSchema);

/* store management
bank details
tax info
KYC docs
product inventory
payouts
analytics
*/
