import mongoose from "mongoose";

const overrideSchema = new mongoose.Schema(
  {
    // Original slot
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
    // Team whose slot is being overridden
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    // New slot assigned
    newSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
    // Guide making the override
    overriddenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Reason for override
    reason: String,
    // Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Approval by admin (if needed)
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvalDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Override", overrideSchema);
