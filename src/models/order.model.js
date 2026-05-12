import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const orderSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
    orderItems: {
      type: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          productname: {
            type: String,
            required: true,
            trim: true,
          },
          productPrice: {
            type: Number,
            required: true,
          },
          productImage: {
            type: String,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
          },
          itemTotal: {
            type: Number,
            required: true,
          }
        },
      ],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Order must contain at least one item",
      },
    },
    subtotal: {
      type: Number,
      required: true,
    },
    shippingCharge: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    payment: {
      paymentMethod: {
        type: String,
        enum: ["COD", "ONLINE"],
        required: true,
      },
      gateway: {
        type: String,
        required: function () {
          return this.payment?.paymentMethod === "ONLINE";
        },
        enum: ["RAZORPAY", "GOOGLEPAY", "PHONEPE", "PAYTM", "UPI"],
      },
      gatewayPaymentId: {
        type: String,
      },
      gatewayOrderId: {
        type: String,
      },
      paymentStatus: {
        type: String,
        required: true,
        enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
        default: "PENDING",
      },
      transactionId: {
        type: String,
      },
      paidAt: {
        type: Date,
      },
    },
    deliveryStatus: {
      type: String,
      enum: ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
      deliveredAt: Date,
      cancelReason: String,
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.plugin(mongooseAggregatePaginate);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ deliveryStatus: 1 });
orderSchema.index({ "payment.paymentStatus": 1 });

export const Order = mongoose.model("Order", orderSchema);
