import Request from "../models/Request.js";
import Slot from "../models/Slot.js";
import User from "../models/User.js";
import Team from "../models/Team.js";
import Session from "../models/Session.js";
import { io } from "../server.js";
import { sendApprovalNotification } from "../services/mailService.js";

// ✅ GET ALL REQUESTS FOR A GUIDE (ONLY THEIR TEAMS)
export const getGuideRequests = async (req, res) => {
  try {
    const guideId = req.user.id;

    // Get all teams managed by guide
    const teams = await Team.find({ guide: guideId }).select("_id");
    const teamIds = teams.map(t => t._id);

    // Get all requests for these teams
    const requests = await Request.find({ team: { $in: teamIds } })
      .populate("student", "name email")
      .populate("team", "name members")
      .populate("session")
      .populate("slot")
      .sort({ createdAt: -1 });

    res.json({ requests, count: requests.length });
  } catch (err) {
    console.error("❌ Get Guide Requests Error:", err.message);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};

// ✅ GET REQUEST DETAILS
export const getRequestDetails = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await Request.findById(requestId)
      .populate("student", "name email")
      .populate("team")
      .populate("session")
      .populate("slot")
      .populate("approvedBy", "name email");

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json({ request });
  } catch (err) {
    console.error("❌ Get Request Details Error:", err.message);
    res.status(500).json({ error: "Failed to fetch request details" });
  }
};

// ✅ APPROVE REQUEST (GUIDE)
export const approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const guideId = req.user.id;

    const request = await Request.findById(requestId)
      .populate("student")
      .populate("team")
      .populate("slot");

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Verify guide owns this team
    const team = await Team.findById(request.team._id);
    if (team.guide.toString() !== guideId) {
      return res.status(403).json({ error: "Not authorized to approve this request" });
    }

    // Approve request
    request.status = "approved";
    request.approvedBy = guideId;
    request.approvalDate = new Date();
    await request.save();

    // Update slot
    const slot = await Slot.findById(request.slot._id);
    slot.status = "approved";
    slot.bookingStatus = {
      team: request.team._id,
      approvedAt: new Date(),
      approvedBy: guideId,
    };
    await slot.save();

    // ** PREVENT RACE CONDITION: Cancel all other pending requests for this session **
    const otherRequests = await Request.find({
      session: request.session,
      _id: { $ne: requestId },
      status: "pending",
    });

    for (const otherRequest of otherRequests) {
      otherRequest.status = "rejected";
      otherRequest.rejectionReason = "Another team's request was approved for this slot";
      await otherRequest.save();

      // Update their slots back to available
      const otherSlot = await Slot.findById(otherRequest.slot._id);
      otherSlot.status = "available";
      otherSlot.request = null;
      await otherSlot.save();
    }

    // Send notification
    const guide = await User.findById(guideId);
    await sendApprovalNotification(
      guide.email,
      guide.name,
      team.name,
      `${slot.startTime} - ${slot.endTime}`
    );

    // Broadcast to all clients
    io.emit("request-approved", {
      requestId,
      slotId: slot._id,
      teamId: team._id,
    });

    res.json({ message: "Request approved", request });
  } catch (err) {
    console.error("❌ Approve Request Error:", err.message);
    res.status(500).json({ error: "Failed to approve request" });
  }
};

// ✅ REJECT REQUEST (GUIDE)
export const rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    const guideId = req.user.id;

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Verify guide owns this team
    const team = await Team.findById(request.team);
    if (team.guide.toString() !== guideId) {
      return res.status(403).json({ error: "Not authorized to reject this request" });
    }

    // Reject request
    request.status = "rejected";
    request.rejectionReason = reason || "Rejected by guide";
    await request.save();

    // Update slot back to available
    const slot = await Slot.findById(request.slot);
    slot.status = "available";
    slot.request = null;
    await slot.save();

    // Broadcast to all clients
    io.emit("request-rejected", {
      requestId,
      slotId: slot._id,
    });

    res.json({ message: "Request rejected", request });
  } catch (err) {
    console.error("❌ Reject Request Error:", err.message);
    res.status(500).json({ error: "Failed to reject request" });
  }
};

// ✅ CANCEL REQUEST (STUDENT - only if pending)
export const cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.student.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to cancel this request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Can only cancel pending requests" });
    }

    // Cancel request
    request.status = "cancelled";
    request.cancelledBy = userId;
    request.cancelledAt = new Date();
    await request.save();

    // Update slot back to available
    const slot = await Slot.findById(request.slot);
    slot.status = "available";
    slot.request = null;
    await slot.save();

    // Broadcast
    io.emit("request-cancelled", {
      requestId,
      slotId: slot._id,
    });

    res.json({ message: "Request cancelled", request });
  } catch (err) {
    console.error("❌ Cancel Request Error:", err.message);
    res.status(500).json({ error: "Failed to cancel request" });
  }
};

// ✅ GET STUDENT BOOKING HISTORY
export const getStudentBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Request.find({ student: userId })
      .populate("team", "name guide")
      .populate("session")
      .populate("slot")
      .sort({ createdAt: -1 });

    res.json({ requests, count: requests.length });
  } catch (err) {
    console.error("❌ Get Student Bookings Error:", err.message);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

// ✅ GET ADMIN PENDING REQUESTS
export const getPendingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: "pending" })
      .populate("student", "name email")
      .populate("team", "name guide")
      .populate("session")
      .populate("slot")
      .sort({ createdAt: -1 });

    res.json({ requests, count: requests.length });
  } catch (err) {
    console.error("❌ Get Pending Requests Error:", err.message);
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
};

// ✅ GET ALL REQUESTS (ADMIN)
export const getAllRequests = async (req, res) => {
  try {
    const { status, teamId, sessionId } = req.query;

    let query = {};
    if (status) query.status = status;
    if (teamId) query.team = teamId;
    if (sessionId) query.session = sessionId;

    const requests = await Request.find(query)
      .populate("student", "name email")
      .populate("team", "name guide")
      .populate("session")
      .populate("slot")
      .sort({ createdAt: -1 })
      .limit(500);

    res.json({ requests, count: requests.length });
  } catch (err) {
    console.error("❌ Get All Requests Error:", err.message);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
};
