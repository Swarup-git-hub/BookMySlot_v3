import express from "express";
import {
  createSession,
  getAllSessions,
  getSessionDetails,
  updateSession,
  deleteSession,
  getConfiguration,
  updateConfiguration,
  getDashboardStats,
  getUpcomingSessions,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes
router.post("/sessions", protect, authorize("admin"), createSession);
router.get("/sessions", protect, authorize("admin"), getAllSessions);
router.get("/sessions/:sessionId", protect, authorize("admin"), getSessionDetails);
router.patch("/sessions/:sessionId", protect, authorize("admin"), updateSession);
router.delete("/sessions/:sessionId", protect, authorize("admin"), deleteSession);

// Configuration
router.get("/config", protect, authorize("admin"), getConfiguration);
router.patch("/config", protect, authorize("admin"), updateConfiguration);

// Dashboard stats
router.get("/dashboard/stats", protect, authorize("admin"), getDashboardStats);
router.get("/session/upcoming", protect, authorize("admin"), getUpcomingSessions);

export default router;
