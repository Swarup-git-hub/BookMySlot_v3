import express from "express";
import {
  getAnalyticsSummary,
  getTeamPerformance,
  getBookingTrend,
  getGuidePerformance,
  getSlotUsageStats,
} from "../controllers/analyticsController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin analytics
router.get("/summary", protect, authorize("admin"), getAnalyticsSummary);
router.get("/team-performance", protect, authorize("admin"), getTeamPerformance);
router.get("/booking-trend", protect, authorize("admin"), getBookingTrend);
router.get("/slot-usage", protect, authorize("admin", "guide"), getSlotUsageStats);
router.get("/guide/:guideId", protect, authorize("admin", "guide"), getGuidePerformance);

export default router;
