import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";

const customerSchema = new Schema(
  {
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
},
{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

customerSchema.virtual("isVerified").get(function () {
  return this.isEmailVerified && this.isMobileVerified;
});

customerSchema.methods.toSafeObject = function () {
  const customerObject = this.toObject();
  delete customerObject.password;
  delete customerObject.refreshTokens;
  return customerObject;
};

export const Customer = User.discriminator("Customer", customerSchema);
