import express from "express";
import {
  generateSlots,
  getSlotsBySession,
  getAvailableSlots,
  toggleSlotStatus,
  getSlotDetails,
  getBookingSummary,
  requestSlot,
} from "../controllers/slotController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/session/:sessionId", getSlotsBySession);
router.get("/:slotId", getSlotDetails);

// Protected routes
router.post("/request", protect, authorize("student"), requestSlot);
router.get("/session/:sessionId/available", getAvailableSlots);
router.get("/session/:sessionId/summary", getBookingSummary);

// Admin routes
router.post("/session/:sessionId/generate", protect, authorize("admin"), generateSlots);
router.patch("/:slotId/toggle", protect, authorize("admin"), toggleSlotStatus);

export default router;