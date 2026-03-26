import Session from "../models/Session.js";
import Slot from "../models/Slot.js";
import Request from "../models/Request.js";
import Team from "../models/Team.js";
import { io } from "../server.js";
import { addMinutesToTime } from "../utils/helpers.js";

// ✅ GENERATE SLOTS FOR A SESSION
export const generateSlots = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (session.slotsGenerated) {
      return res.status(400).json({ error: "Slots already generated for this session" });
    }

    const { configuration } = session;
    const slots = [];
    let lastEndTime = null;

    // Generate forenoon slots
    lastEndTime = configuration.forenoon.startTime;
    for (let i = 1; i <= configuration.forenoon.slots; i++) {
      const startTime = lastEndTime;
      const endTime = addMinutesToTime(startTime, configuration.slotDuration);

      slots.push({
        session: sessionId,
        period: "forenoon",
        slotNumber: i,
        startTime,
        endTime,
        status: "available",
        isDisabled: false,
      });

      lastEndTime = endTime;
    }

    // Generate afternoon slots
    lastEndTime = configuration.afternoon.startTime;
    for (let i = 1; i <= configuration.afternoon.slots; i++) {
      const startTime = lastEndTime;
      const endTime = addMinutesToTime(startTime, configuration.slotDuration);

      slots.push({
        session: sessionId,
        period: "afternoon",
        slotNumber: i,
        startTime,
        endTime,
        status: "available",
        isDisabled: false,
      });

      lastEndTime = endTime;
    }

    // Insert all slots
    const createdSlots = await Slot.insertMany(slots);

    // Mark session as slots generated
    session.slotsGenerated = true;
    session.totalSlots = createdSlots.length;
    await session.save();

    // Broadcast to all clients
    io.emit("slots-generated", { sessionId, totalSlots: createdSlots.length });

    res.status(201).json({
      message: "Slots generated successfully",
      totalSlots: createdSlots.length,
      slots: createdSlots,
    });
  } catch (err) {
    console.error("❌ Generate Slots Error:", err.message);
    res.status(500).json({ error: "Failed to generate slots" });
  }
};

// ✅ GET ALL SLOTS FOR A SESSION
export const getSlotsBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { period } = req.query;

    let query = { session: sessionId };
    if (period) query.period = period;

    const slots = await Slot.find(query)
      .populate("bookingStatus.team")
      .populate("bookingStatus.approvedBy")
      .populate("request")
      .sort({ period: 1, slotNumber: 1 });

    res.json({ slots, count: slots.length });
  } catch (err) {
    console.error("❌ Get Slots Error:", err.message);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
};

// ✅ GET AVAILABLE SLOTS
export const getAvailableSlots = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const slots = await Slot.find({
      session: sessionId,
      status: "available",
      isDisabled: false,
    }).sort({ period: 1, slotNumber: 1 });

    res.json({ slots, count: slots.length });
  } catch (err) {
    console.error("❌ Get Available Slots Error:", err.message);
    res.status(500).json({ error: "Failed to fetch available slots" });
  }
};

// ✅ DISABLE/ENABLE SLOT (ADMIN ONLY)
export const toggleSlotStatus = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { isDisabled, reason } = req.body;

    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    slot.isDisabled = isDisabled;
    if (isDisabled) {
      slot.disabledReason = reason || "Disabled by admin";
      slot.status = "disabled";
    } else {
      slot.status = "available";
      slot.disabledReason = null;
    }

    await slot.save();

    // Broadcast to all clients
    io.emit("slot-status-changed", { slotId, isDisabled, status: slot.status });

    res.json({ message: "Slot status updated", slot });
  } catch (err) {
    console.error("❌ Toggle Slot Status Error:", err.message);
    res.status(500).json({ error: "Failed to update slot status" });
  }
};

// ✅ GET SLOT DETAILS
export const getSlotDetails = async (req, res) => {
  try {
    const { slotId } = req.params;

    const slot = await Slot.findById(slotId)
      .populate("session")
      .populate("bookingStatus.team")
      .populate("bookingStatus.approvedBy")
      .populate("request")
      .populate("override");

    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    res.json({ slot });
  } catch (err) {
    console.error("❌ Get Slot Details Error:", err.message);
    res.status(500).json({ error: "Failed to fetch slot details" });
  }
};

// ✅ GET BOOKING SUMMARY
export const getBookingSummary = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const slots = await Slot.find({ session: sessionId });

    const summary = {
      total: slots.length,
      available: slots.filter(s => s.status === "available" && !s.isDisabled).length,
      pending: slots.filter(s => s.status === "pending").length,
      approved: slots.filter(s => s.status === "approved").length,
      disabled: slots.filter(s => s.isDisabled).length,
    };

    res.json({ summary });
  } catch (err) {
    console.error("❌ Get Booking Summary Error:", err.message);
    res.status(500).json({ error: "Failed to fetch booking summary" });
  }
};

// ✅ REQUEST SLOT (STUDENT)
export const requestSlot = async (req, res) => {
  try {
    const { slotId } = req.body;
    const userId = req.user.id;

    // Get user and check team
    const User = (await import("../models/User.js")).default;
    const user = await User.findById(userId);

    if (!user || !user.team) {
      return res.status(400).json({ error: "User not in any team" });
    }

    // Get slot and session
    const slot = await Slot.findById(slotId).populate("session");

    if (!slot) {
      return res.status(404).json({ error: "Slot not found" });
    }

    if (slot.isDisabled) {
      return res.status(400).json({ error: "Slot is disabled" });
    }

    // Check if slot already has a booking
    if (slot.status !== "available") {
      return res.status(400).json({ error: "Slot not available" });
    }

    // Check if team already has a request/booking for this session
    const existingRequest = await Request.findOne({
      team: user.team,
      session: slot.session,
    });

    if (existingRequest) {
      return res.status(400).json({ error: "Your team already has a request for this session" });
    }

    // Check if student already requested this session
    const studentRequest = await Request.findOne({
      student: userId,
      session: slot.session,
    });

    if (studentRequest) {
      return res.status(400).json({ error: "You already have a request for this session" });
    }

    // Create booking request
    const request = new Request({
      student: userId,
      team: user.team,
      session: slot.session,
      slot: slotId,
      status: "pending",
    });

    await request.save();

    // Update slot
    slot.status = "pending";
    slot.request = request._id;
    await slot.save();

    // Get guide and send notification
    const team = await Team.findById(user.team).populate("guide");
    const { sendRequestNotification } = await import("../services/mailService.js");
    await sendRequestNotification(team.guide.email, team.guide.name, user.name, team.name);

    // Broadcast to guide
    io.emit("new-slot-request", {
      requestId: request._id,
      slotId,
      teamId: user.team,
      studentName: user.name,
    });

    res.status(201).json({
      message: "Slot request submitted",
      request,
    });
  } catch (err) {
    console.error("❌ Request Slot Error:", err.message);
    res.status(500).json({ error: "Failed to request slot" });
  }
};
