import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    // Reference to session
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    // Forenoon or Afternoon
    period: {
      type: String,
      enum: ["forenoon", "afternoon"],
      required: true,
    },
    // Slot number (1-5)
    slotNumber: {
      type: Number,
      required: true,
    },
    // Start time (e.g., "09:00")
    startTime: {
      type: String,
      required: true,
    },
    // End time (e.g., "09:30")
    endTime: {
      type: String,
      required: true,
    },
    // Status of slot
    status: {
      type: String,
      enum: ["available", "pending", "approved", "disabled"],
      default: "available",
    },
    // Booked by team
    bookingStatus: {
      team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        default: null,
      },
      approvedAt: Date,
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    // Pending request for this slot
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      default: null,
    },
    // Override log
    override: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Override",
      default: null,
    },
    // Admin can disable specific slots
    isDisabled: {
      type: Boolean,
      default: false,
    },
    disabledReason: String,

    // Associated guide (if restricted to specific guide)
    guide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Slot", slotSchema);