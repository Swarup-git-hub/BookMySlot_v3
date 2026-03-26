import mongoose from "mongoose";

const configSchema = new mongoose.Schema(
  {
    // System-wide configuration
    configName: {
      type: String,
      unique: true,
      default: "default",
    },
    // Session configuration
    session: {
      forenoon: {
        startTime: {
          type: String,
          default: "09:00",
        },
        endTime: {
          type: String,
          default: "13:00",
        },
        slotCount: {
          type: Number,
          default: 4,
        },
      },
      afternoon: {
        startTime: {
          type: String,
          default: "14:00",
        },
        endTime: {
          type: String,
          default: "18:00",
        },
        slotCount: {
          type: Number,
          default: 4,
        },
      },
    },
    // Slot duration in minutes
    slotDuration: {
      type: Number,
      default: 30,
    },
    // Team configuration
    team: {
      minStudents: {
        type: Number,
        default: 1,
      },
      maxStudents: {
        type: Number,
        default: 5,
      },
      guideCanManage: {
        type: Number,
        default: 4,
      },
    },
    // OTP configuration
    otp: {
      expiryMinutes: {
        type: Number,
        default: 5,
      },
      maxRequests: {
        type: Number,
        default: 5,
      },
    },
    // Email configuration
    email: {
      senderName: {
        type: String,
        default: "Review Slot Booking",
      },
      senderEmail: String,
    },
    // Feature flags
    features: {
      realTimeUpdates: {
        type: Boolean,
        default: true,
      },
      darkMode: {
        type: Boolean,
        default: true,
      },
      excelExport: {
        type: Boolean,
        default: true,
      },
      csvExport: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Config", configSchema);
