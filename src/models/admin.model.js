import mongoose, { Schema } from "mongoose";
import { commonAuthFields, attachHashCompare, attachTokenMethods, attachSessionMethods } from "./commonAuth.model.js";

const adminSchema = new Schema(
  {
    ...commonAuthFields,
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "MODERATOR"],
      default: "ADMIN",
    },  
    suggestions: {
      type: [
        {
          option: {
            type: String,
            enum: ["ENQUIRY", "SUGGESTION", "CHAT", "COMPLAINT"],
            required: true,
          },
          comment: {
            type: String,
            trim: true,
          },
          media: [
            {
              url: {
                type: String,
                required: true,
              },
              type: {
                type: String,
                enum: ["IMAGE", "VIDEO"],
              },
            },
          ],
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

// to hash password before saving admin document:
// Alternative way, to hash password before saving user document:
attachHashCompare(adminSchema);

attachTokenMethods(adminSchema);

attachSessionMethods(adminSchema);

adminSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $exists: true } } } );
adminSchema.index({ mobileNumber: 1 }, { unique: true, partialFilterExpression: { mobileNumber: { $exists: true } } } );

export const Admin = mongoose.model("Admin", adminSchema);
