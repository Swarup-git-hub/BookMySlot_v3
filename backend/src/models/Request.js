import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    // Student who requested
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Team requesting
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    // Session for which slot is requested
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    // Requested slot
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
    // Request status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    // Guide approval
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvalDate: Date,
    rejectionReason: String,
    // Cancellation
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancellationReason: String,
    cancelledAt: Date,
  },
  { timestamps: true }
);

// Prevent duplicate requests from same team for same session
requestSchema.index({ team: 1, session: 1 }, { unique: true });

export default mongoose.model("Request", requestSchema);
