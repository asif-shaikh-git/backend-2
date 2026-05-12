import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";

const customerSchema = new Schema({
  orderHistory: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    default: [],
  },
  feedbackHistory: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Feedback",
      },
    ],
    default: [],
  },
  likesHistory: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    default: [],
  },
});

customerSchema.virtual("isVerified").get(function () {
  return this.isEmailVerified && this.isMobileVerified;
});

export const Customer = User.discriminator("Customer", customerSchema);
