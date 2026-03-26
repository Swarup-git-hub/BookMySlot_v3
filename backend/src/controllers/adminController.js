import Session from "../models/Session.js";
import Slot from "../models/Slot.js";
import Request from "../models/Request.js";
import Config from "../models/Config.js";
import User from "../models/User.js";
import Team from "../models/Team.js";
import { formatDate } from "../utils/helpers.js";

// ✅ CREATE SESSION
export const createSession = async (req, res) => {
  try {
    const { date, configuration } = req.body;

    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    // Check if session exists for this date
    const sessionDate = new Date(date);
    sessionDate.setHours(0, 0, 0, 0);

    const existingSession = await Session.findOne({
      date: sessionDate,
    });

    if (existingSession) {
      return res.status(409).json({ error: "Session already exists for this date" });
    }

    // Use provided configuration or defaults
    const newSession = new Session({
      date: sessionDate,
      configuration: configuration || {
        forenoon: {
          startTime: "09:00",
          endTime: "13:00",
          slots: 4,
        },
        afternoon: {
          startTime: "14:00",
          endTime: "18:00",
          slots: 4,
        },
        slotDuration: 30,
      },
    });

    const totalSlots = 
      (configuration?.forenoon?.slots || 4) + 
      (configuration?.afternoon?.slots || 4);

    newSession.totalSlots = totalSlots;
    await newSession.save();

    res.status(201).json({ message: "Session created successfully", session: newSession });
  } catch (err) {
    console.error("❌ Create Session Error:", err.message);
    res.status(500).json({ error: "Failed to create session" });
  }
};

// ✅ GET ALL SESSIONS
export const getAllSessions = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    let query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (status) query.status = status;

    const sessions = await Session.find(query).sort({ date: -1 }).limit(500);

    res.json({ sessions, count: sessions.length });
  } catch (err) {
    console.error("❌ Get All Sessions Error:", err.message);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

// ✅ GET SESSION DETAILS
export const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Get booking stats
    const slots = await Slot.find({ session: sessionId });
    const bookings = {
      total: slots.length,
      available: slots.filter(s => s.status === "available" && !s.isDisabled).length,
      pending: slots.filter(s => s.status === "pending").length,
      approved: slots.filter(s => s.status === "approved").length,
      disabled: slots.filter(s => s.isDisabled).length,
    };

    res.json({ session, bookings });
  } catch (err) {
    console.error("❌ Get Session Details Error:", err.message);
    res.status(500).json({ error: "Failed to fetch session details" });
  }
};

// ✅ UPDATE SESSION
export const updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { configuration, status } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    if (configuration) {
      session.configuration = { ...session.configuration, ...configuration };
    }

    if (status) {
      session.status = status;
    }

    await session.save();

    res.json({ message: "Session updated successfully", session });
  } catch (err) {
    console.error("❌ Update Session Error:", err.message);
    res.status(500).json({ error: "Failed to update session" });
  }
};

// ✅ DELETE SESSION
export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Delete session and all related slots
    await Session.findByIdAndDelete(sessionId);
    await Slot.deleteMany({ session: sessionId });
    await Request.deleteMany({ session: sessionId });

    res.json({ message: "Session deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Session Error:", err.message);
    res.status(500).json({ error: "Failed to delete session" });
  }
};

// ✅ GET CONFIGURATION
export const getConfiguration = async (req, res) => {
  try {
    let config = await Config.findOne({ configName: "default" });

    if (!config) {
      config = new Config({ configName: "default" });
      await config.save();
    }

    res.json({ config });
  } catch (err) {
    console.error("❌ Get Configuration Error:", err.message);
    res.status(500).json({ error: "Failed to fetch configuration" });
  }
};

// ✅ UPDATE CONFIGURATION
export const updateConfiguration = async (req, res) => {
  try {
    const { session, slotDuration, team, otp, features } = req.body;

    let config = await Config.findOne({ configName: "default" });

    if (!config) {
      config = new Config({ configName: "default" });
    }

    if (session) config.session = { ...config.session, ...session };
    if (slotDuration) config.slotDuration = slotDuration;
    if (team) config.team = { ...config.team, ...team };
    if (otp) config.otp = { ...config.otp, ...otp };
    if (features) config.features = { ...config.features, ...features };

    await config.save();

    res.json({ message: "Configuration updated successfully", config });
  } catch (err) {
    console.error("❌ Update Configuration Error:", err.message);
    res.status(500).json({ error: "Failed to update configuration" });
  }
};

// ✅ GET ADMIN DASHBOARD STATS
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGuides = await User.countDocuments({ role: "guide" });
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTeams = await Team.countDocuments();
    const totalSessions = await Session.countDocuments();
    const totalRequests = await Request.countDocuments();
    const pendingRequests = await Request.countDocuments({ status: "pending" });
    const approvedRequests = await Request.countDocuments({ status: "approved" });
    const rejectedRequests = await Request.countDocuments({ status: "rejected" });

    const totalSlots = await Slot.countDocuments();
    const bookedSlots = await Slot.countDocuments({ status: "approved" });
    const pendingSlots = await Slot.countDocuments({ status: "pending" });
    const disabledSlots = await Slot.countDocuments({ isDisabled: true });

    const slotUtilization = totalSlots > 0 
      ? Math.round((bookedSlots / totalSlots) * 100) 
      : 0;

    res.json({
      users: {
        total: totalUsers,
        guides: totalGuides,
        students: totalStudents,
      },
      teams: totalTeams,
      sessions: totalSessions,
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
      },
      slots: {
        total: totalSlots,
        booked: bookedSlots,
        pending: pendingSlots,
        disabled: disabledSlots,
        utilizationPercentage: slotUtilization,
      },
    });
  } catch (err) {
    console.error("❌ Get Dashboard Stats Error:", err.message);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

// ✅ GET UPCOMINGSES SESSIONS
export const getUpcomingSessions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessions = await Session.find({
      date: { $gte: today },
      status: { $in: ["scheduled", "ongoing"] },
    })
      .sort({ date: 1 })
      .limit(10);

    res.json({ sessions, count: sessions.length });
  } catch (err) {
    console.error("❌ Get Upcoming Sessions Error:", err.message);
    res.status(500).json({ error: "Failed to fetch upcoming sessions" });
  }
};
