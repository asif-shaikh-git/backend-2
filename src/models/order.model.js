import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({
    orderPrice: {
        type: Number,
        required: true
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderItems: [{
          productId: {
              type: Schema.Types.ObjectId,
              ref: "Product",
              required: true
           },
           productname: {
             type: String,
             required: true,
             trim: true
           },
           productPrice: {
             type: Number,
             required: true
           },
           quantity: {
             type: Number,
             required: true,
             min: 1
            }
        }],
    address: {
        type: Schema.Types.ObjectId,
        ref: "Address",
        required: true 
    },
    payment: {
        paymentMethod: {
          type: String,
          enum: ["COD", "ONLINE"],
          required: true
        },
        gateway: {
          type: String,
          enum: ["RAZORPAY", "GOOGLEPAY", "PHONEPAY", "PAYTM", "UPI" ]   
        },
        gatewayPaymentId: {
            type: String
        },
        gatewayOrderId: {
            type: String
        },
        paymentStatus: {
           type: String,
           required: true,
           enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
           default: "PENDING"
        },
        transactionId: {
            type: String
        },
        paidAt: {
          type: Date
        }
    },
    deliveryStatus: {
        type: String,
        enum: [ "PENDING", "SHIPPED", "DELIVERED", "CANCELLED" ],
        default: "PENDING"
    },
    statusHistory: [{
        status: String,
        updatedAt: Date
    }]
},
{ timestamps: true }
);

export const Order = mongoose.model( "Order", orderSchema );