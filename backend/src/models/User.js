import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    role: {
      type: String,
      enum: ["student", "guide", "admin"],
      default: "student",
    },
    // For students: reference to their team
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    // OTP for login
    otp: String,
    otpExpiry: Date,
    otpAttempts: {
      type: Number,
      default: 0,
    },
    lastOtpRequestTime: Date,
    // JWT token
    refreshToken: String,
    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
    // Metadata
    phone: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);