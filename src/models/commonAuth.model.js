import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const commonAuthFields = {
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
  address: [
    {
      type: Schema.Types.ObjectId,
      ref: "Address",
      trim: true,
      index: true,
    },
  ],
  avatar: {
    type: String, //cloudinary url
    required: [true, "User avatar is required"],
    default: "",
  },
  coverImage: {
    type: String, //cloudinary url
    default: "",
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
};

export const commonAuthSchema = new Schema(commonAuthFields);

export const attachHashCompare = (schema) => {
  // to hash password before saving user document:
  schema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, Number(process.env.BCRYPT_ROUNDS) || 10 );
    
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
    return jwt.sign(
      {
        _id: this._id,
        email: this.email,
        role: this.role,
        username: this.username,
        tokenVersion: {
          type: Number,
          default: 0,
        }
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      }
    );
  };

  // 2. refresh token:
  schema.methods.generateRefreshToken = function () {
    return jwt.sign({ _id: this._id, tokenVersion: this.tokenVersion }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    });
  };
};

export const attachSessionMethods = (schema) => {

  // to remove expired refresh tokens:
  schema.methods.cleanupRefreshTokens = async function () {
    const now = new Date();

    const originalLength = this.refreshTokens.length;

    this.refreshTokens = this.refreshTokens.filter(
      (session) => session.expiresAt.getTime() > now.getTime()
    );

    // only active refreshTokens are save in session (DB):
    await this.save({ validateBeforeSave: false });

    // returns true if any expired tokens were removed
    return this.refreshTokens.length !== originalLength;
  };

  // to remove current device session : after user logout or password change

  schema.methods.removeRefreshToken = async function (refreshToken) {
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

    // only active refreshTokens are save in session (DB):
    await this.save({ validateBeforeSave: false });

  };
};

