import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productname: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productImage: {
          type: String,
          required: true
        },
        productPrice: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1
        },
      },
    ],
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 }, { unique: true });

cartSchema.plugin(mongooseAggregatePaginate);

export const Cart = mongoose.model("Cart", cartSchema);
