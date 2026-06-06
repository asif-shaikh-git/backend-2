import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

export const commonAuthFields = {
  userId: {
    type: Number,
    required: true,
    index: true,
    unique: true,
  },
  username: {
    type: String,
    required: [true, "Username is required"],
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
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  mobileNumber: {
    type: String,
    required: [true, "Mobile number required"],
    unique: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"],
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isMobileVerified: {
    type: Boolean,
    default: false,
  },
  tokenVersion: {
    type: Number,
    default: 0,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
    select: false,
  },
  fullName: {
    type: String,
    required: [true, "User fullname is required"],
    trim: true,
    index: true,
  },
  address: [
    {
      type: Schema.Types.ObjectId,
      ref: "Address",
      index: true,
    },
  ],
  accountType: {
    type: String,
    enum: ["Admin", "Vendor", "Customer"],
    required: true,
  },
  avatar: {
    type: String, //cloudinary url
    required: true,
    default: "",
  },
  avatarPublicId: {
    type: String, //cloudinary url
    required: true,
    default: "",
  },
  coverImage: {
    type: String, //cloudinary url
    default: "",
  },
  coverImagePublicId: {
    type: String, //cloudinary url
    default: "",
  },
  media: {
    url: String,
    publicId: String,
    resourceType: String,
  },
  socketIds: [
    {
      type: String,
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
};

export const commonAuthSchema = new Schema(commonAuthFields);

export const attachHashCompare = (schema) => {
  // to hash password before saving user document:
  schema.pre("save", async function (next) {
    // if password field is not modified, skip hashing and move to next middleware:
    if (!this.isModified("password")) return next();
    
    // if password is modified, hash the new password before saving:
    this.password = await bcrypt.hash(
      this.password,
      Number(process.env.BCRYPT_ROUNDS) || 10
    );

    next();
  });

  // to compare password during login:
  schema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
};

export const attachTokenMethods = (schema) => {
  // 1.access token:
  schema.methods.generateAccessToken = function () {
    const payload = {
      _id: this._id,
      accountType: this.accountType,
      tokenVersion: this.tokenVersion,
    };

    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    });
  };

  // 2. refresh token:
  schema.methods.generateRefreshToken = function () {
    const payload = {
      _id: this._id,
      accountType: this.accountType,
      tokenVersion: this.tokenVersion,
      jti: nanoid(), // unique identifier for the token to prevent replay attacks
    };
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    });
  };
};

export const attachSessionMethods = (schema) => {
  // to remove expired refresh tokens:
  schema.methods.cleanupRefreshTokens = async function () {
    // Get current time in milliseconds:
    const now = Date.now();
   
    // Store original length of refreshTokens array to check if any expired tokens were removed:
    const originalLength = this.refreshTokens.length;
   
    // Filter out expired tokens by keeping only those whose expiresAt is in the future:
    this.refreshTokens = this.refreshTokens.filter(
      (session) => session.expiresAt && session.expiresAt.getTime() > now
    );

    // returns true if any expired tokens were removed
    return {
      expiredSessionsRemoved: this.refreshTokens.length !== originalLength,
      removedCount: originalLength - this.refreshTokens.length,
      activeSessions: this.refreshTokens.length,
    };
  };

  // to remove current device session : after user logout or password change

  schema.methods.removeRefreshToken = async function (refreshToken) {
    const originalLength = this.refreshTokens.length;

    const remainingSessions = [];

    // Loop through all refresh tokens of the user:
    for (const session of this.refreshTokens) {
      // Compare the refresh token from cookie with the hashed token in database:
      const isMatch = await bcrypt.compare(refreshToken, session.token);

      // keep in session-DB only those that do not match the refresh token from cookie:
      if (!isMatch) {
        remainingSessions.push(session);
      }
    }

    // replace old session from DB which is logout:
    this.refreshTokens = remainingSessions;

    return {
      sessionRemoved: this.refreshTokens.length !== originalLength,
      removedCount: originalLength - this.refreshTokens.length,
      activeSessions: this.refreshTokens.length,
    };
  };
};
