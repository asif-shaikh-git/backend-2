import mongoose, {Schema} from "mongoose";

const passwordResetTokenSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // Ensure one token per user
        },
        token: {    
            type: String,
            required: true,
            select: false, // Do not return token by default in queries
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);  

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Automatically delete expired tokens     

export const PasswordResetToken = mongoose.model("PasswordResetToken", passwordResetTokenSchema);