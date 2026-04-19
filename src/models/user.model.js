import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import { commonAuthFields, attachHashCompare, attachTokenMethods, attachSessionMethods } from "./commonAuth.model.js";


const userSchema = new Schema(
  {
    ...commonAuthFields,

    role: {
      type: String,
      enum: ["user", "vendor"],
      default: "user",
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
  },
  { timestamps: true }
);

// Add pagination plugin:
userSchema.plugin(mongooseAggregatePaginate);

// to hash password before saving user document:
/*userSchema.pre("save", async function (next) {
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
*/
// Alternative way, to hash password before saving user document:
attachHashCompare(userSchema);

// to generate JWT access token: Short-lived access token
/*userSchema.methods.generateAccessToken = function () {
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

*/

// Alternative way,to generate JWT access token: Short-lived access token
// and to generate JWT refresh token: Long-lived refresh token:
attachTokenMethods(userSchema);

// remove expired session first : in case user has multiple sessions 
// and some of them are expired, then remove those expired sessions
//  before adding new session to DB:

/*userSchema.methods.cleanupRefreshTokens = async function () {
  const now = new Date();

  const originalLength = this.refreshTokens.length;

  this.refreshTokens = this.refreshTokens.filter(
    (session) => session.expiresAt.getTime() > now.getTime()
  );

  // returns true if any expired tokens were removed
  return this.refreshTokens.length !== originalLength;
};

// remove current device session : after user logout or password change
userSchema.methods.removeRefreshToken = async function (refreshToken) {
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

};
*/
// Alternative way, to remove expired session first : in case user has multiple sessions 
// and some of them are expired, then remove those expired sessions
//  before adding new session to DB and to remove current device session : after user logout or password change:  
attachSessionMethods(userSchema);

userSchema.index({ email: 1 });
userSchema.index({ mobileNumber: 1 });

export const User = mongoose.model("User", userSchema);
