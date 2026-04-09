import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number required"],
      unique: true,
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        "Please enter a valid 10-digit Indian mobile number",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    fullName: {
      type: String,
      required: [true, "User fullname is required"],
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url
      default: "",
    },
    coverImage: {
      type: String, //cloudinary url
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin", "vendor"],
      default: "user",
    },
    socketId: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    orderHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    feedbackHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Feedback",
      },
    ],
    likesHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    refreshTokens: [
      {
        token: {
          type: String,
          required: true,
          select: false,
        },
        sessionId: {
          type: String,
          required: true,
        },
        device: {
          type: String,
          required: true,
        },
        ipAddress: {
          type: String,
        },
        userAgent: {
          type: String,
        },
        expiresAt: {
          type: Date,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Add pagination plugin:
userSchema.plugin(mongooseAggregatePaginate);

// to hash password before saving user document:
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// to compare password during login:
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// to generate JWT access token: Short-lived access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
  );
};

// to generate JWT refresh token: Long-lived refresh token

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

userSchema.methods.cleanupRefreshTokens = function () {
  const now = new Date();

  const originalLength = this.refreshTokens.length;

  this.refreshTokens = this.refreshTokens.filter(
    session => session.expiresAt.getTime() > now.getTime()
  );
  
  // returns true if any expired tokens were removed
  return this.refreshTokens.length !== originalLength; 
};


export const User = mongoose.model("User", userSchema);
