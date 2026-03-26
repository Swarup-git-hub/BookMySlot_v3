import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    // Session date (unique per day)
    date: {
      type: Date,
      required: true,
      unique: true,
    },
    // Session configuration
    configuration: {
      // Forenoon times
      forenoon: {
        startTime: {
          type: String,
          default: "09:00",
        },
        endTime: {
          type: String,
          default: "13:00",
        },
        slots: {
          type: Number,
          default: 4,
        },
      },
      // Afternoon times
      afternoon: {
        startTime: {
          type: String,
          default: "14:00",
        },
        endTime: {
          type: String,
          default: "18:00",
        },
        slots: {
          type: Number,
          default: 4,
        },
      },
      // Slot duration in minutes
      slotDuration: {
        type: Number,
        default: 30,
      },
    },
    // Total slots per session
    totalSlots: {
      type: Number,
      default: 8,
    },
    // Status of session
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },
    // Auto-generate slots flag
    slotsGenerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
