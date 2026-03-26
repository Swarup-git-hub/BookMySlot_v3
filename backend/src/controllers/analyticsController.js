import Request from "../models/Request.js";
import Session from "../models/Session.js";
import Slot from "../models/Slot.js";
import Team from "../models/Team.js";

// ✅ GET ANALYTICS SUMMARY
export const getAnalyticsSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let sessionQuery = {};
    if (startDate || endDate) {
      sessionQuery.date = {};
      if (startDate) sessionQuery.date.$gte = new Date(startDate);
      if (endDate) sessionQuery.date.$lte = new Date(endDate);
    }

    const sessions = await Session.find(sessionQuery);
    const sessionIds = sessions.map(s => s._id);

    const totalSessions = sessions.length;
    const totalRequests = await Request.countDocuments({ session: { $in: sessionIds } });
    const approvedRequests = await Request.countDocuments({ 
      session: { $in: sessionIds },
      status: "approved" 
    });
    const pendingRequests = await Request.countDocuments({
      session: { $in: sessionIds },
      status: "pending"
    });
    const rejectedRequests = await Request.countDocuments({
      session: { $in: sessionIds },
      status: "rejected"
    });

    const totalSlots = await Slot.countDocuments({ session: { $in: sessionIds } });
    const bookedSlots = await Slot.countDocuments({
      session: { $in: sessionIds },
      status: "approved"
    });

    const slotUtilization = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;
    const approvalRate = totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0;

    res.json({
      totalSessions,
      totalRequests,
      approvedRequests,
      pendingRequests,
      rejectedRequests,
      totalSlots,
      bookedSlots,
      slotUtilization,
      approvalRate,
    });
  } catch (err) {
    console.error("❌ Get Analytics Summary Error:", err.message);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

// ✅ GET TEAM PERFORMANCE
export const getTeamPerformance = async (req, res) => {
  try {
    const teams = await Team.find().populate("guide", "name");

    const teamPerformance = await Promise.all(
      teams.map(async (team) => {
        const requests = await Request.find({ team: team._id });
        const approved = requests.filter(r => r.status === "approved").length;
        const pending = requests.filter(r => r.status === "pending").length;
        const rejected = requests.filter(r => r.status === "rejected").length;

        return {
          teamId: team._id,
          teamName: team.name,
          guideName: team.guide?.name,
          memberCount: team.members.length,
          totalRequests: requests.length,
          approvedRequests: approved,
          pendingRequests: pending,
          rejectedRequests: rejected,
          approvalRate: requests.length > 0 ? Math.round((approved / requests.length) * 100) : 0,
        };
      })
    );

    res.json({ teamPerformance, count: teamPerformance.length });
  } catch (err) {
    console.error("❌ Get Team Performance Error:", err.message);
    res.status(500).json({ error: "Failed to fetch team performance" });
  }
};

// ✅ GET BOOKING TREND
export const getBookingTrend = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("session")
      .sort({ createdAt: 1 });

    const trendMap = {};

    requests.forEach((req) => {
      const date = new Date(req.session.date).toISOString().split("T")[0];

      if (!trendMap[date]) {
        trendMap[date] = {
          date,
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
        };
      }

      trendMap[date].total++;
      if (req.status === "approved") trendMap[date].approved++;
      else if (req.status === "pending") trendMap[date].pending++;
      else if (req.status === "rejected") trendMap[date].rejected++;
    });

    const trend = Object.values(trendMap);

    res.json({ trend, count: trend.length });
  } catch (err) {
    console.error("❌ Get Booking Trend Error:", err.message);
    res.status(500).json({ error: "Failed to fetch booking trend" });
  }
};

// ✅ GET GUIDE PERFORMANCE
export const getGuidePerformance = async (req, res) => {
  try {
    const { guideId } = req.params;

    const teams = await Team.find({ guide: guideId });
    const teamIds = teams.map(t => t._id);

    const requests = await Request.find({ team: { $in: teamIds } });

    const stats = {
      totalTeams: teams.length,
      totalMembers: teams.reduce((sum, t) => sum + t.members.length, 0),
      totalRequests: requests.length,
      approvedRequests: requests.filter(r => r.status === "approved").length,
      pendingRequests: requests.filter(r => r.status === "pending").length,
      rejectedRequests: requests.filter(r => r.status === "rejected").length,
      approvalRate: requests.length > 0 
        ? Math.round((requests.filter(r => r.status === "approved").length / requests.length) * 100)
        : 0,
    };

    res.json(stats);
  } catch (err) {
    console.error("❌ Get Guide Performance Error:", err.message);
    res.status(500).json({ error: "Failed to fetch guide performance" });
  }
};

// ✅ GET SLOT USAGE STATISTICS
export const getSlotUsageStats = async (req, res) => {
  try {
    const { sessionId } = req.query;

    let query = {};
    if (sessionId) query.session = sessionId;

    const slots = await Slot.find(query);

    const stats = {
      total: slots.length,
      available: slots.filter(s => s.status === "available").length,
      pending: slots.filter(s => s.status === "pending").length,
      approved: slots.filter(s => s.status === "approved").length,
      disabled: slots.filter(s => s.isDisabled).length,
      utilizationRate: slots.length > 0 
        ? Math.round((slots.filter(s => s.status === "approved").length / slots.length) * 100)
        : 0,
      forenoonStats: {
        total: slots.filter(s => s.period === "forenoon").length,
        booked: slots.filter(s => s.period === "forenoon" && s.status === "approved").length,
      },
      afternoonStats: {
        total: slots.filter(s => s.period === "afternoon").length,
        booked: slots.filter(s => s.period === "afternoon" && s.status === "approved").length,
      },
    };

    res.json(stats);
  } catch (err) {
    console.error("❌ Get Slot Usage Stats Error:", err.message);
    res.status(500).json({ error: "Failed to fetch slot usage statistics" });
  }
};
