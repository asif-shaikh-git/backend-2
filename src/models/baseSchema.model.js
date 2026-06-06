import { Schema } from "mongoose";
import { 
  commonAuthFields,
  attachHashCompare,
  attachTokenMethods,
  attachSessionMethods, } from "./commonAuth.model.js";

export const baseSchema = new Schema(
  {
    ...commonAuthFields,
  },
  {
    discriminatorKey: "accountType",
    timestamps: true,
    toJSON: { virtuals: true },   // userSchema.set("toJSON", { virtuals: true });
    toObject: { virtuals: true },  // userSchema.set("toObject", { virtuals: true });
  }
);

attachHashCompare(baseSchema);
attachTokenMethods(baseSchema);
attachSessionMethods(baseSchema);