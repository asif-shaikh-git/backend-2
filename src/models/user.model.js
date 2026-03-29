import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, 
        index: true
    },
    email: {
        type: String,
        required: [ true, "Email is required" ],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
           "Please enter a valid email address"
        ]
    },
    mobileNumber: {
        type: String,
        required: [true, "Mobile number required"],
        unique: true,
        trim: true,
        match: [
          /^[6-9]\d{9}$/,
          "Please enter a valid 10-digit Indian mobile number"
        ]
    },
    password: {
        type: String,
        required: [ true, "Password is required" ],
        minlength: 4
    },
    fullName: {
        type: String,
        required: [ true, "User fullname is required" ],
        trim: true,
        index: true
    },
    avatar: {
        type: String,  //cloudinary url
        required: true,
    },
    coverImage: {
        type: String  //cloudinary url
    },
    orderHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Order"
    }],
    feedbackHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Feedback"
    }],
    likesHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Product"
    }],
    refreshToken: {
        type: String
    }
},
{ timestamps: true }
);

export const User = mongoose.model( "User", userSchema );

