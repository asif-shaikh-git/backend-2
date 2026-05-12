import mongoose, { Schema } from "mongoose";
import {
  commonAuthFields,
  attachHashCompare,
  attachTokenMethods,
  attachSessionMethods,
} from "./commonAuth.model.js";

const adminSchema = new Schema(
  {
    ...commonAuthFields,
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
      default: "ADMIN",
    },
    suggestions: {
      type: [ suggestionSchema ],
      default: [],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// to hash password before saving admin document:
// Alternative way, to hash password before saving user document:
attachHashCompare(adminSchema);

attachTokenMethods(adminSchema);

attachSessionMethods(adminSchema);

adminSchema.virtual("isVerified").get(function () {
  return this.isEmailVerified && this.isMobileVerified;
});

adminSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $exists: true, $ne: null } },
  }
);
adminSchema.index(
  { mobileNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { mobileNumber: { $exists: true, $ne: null } },
  }
);

export const Admin = mongoose.model("Admin", adminSchema);
