import express from "express";
import {
  exportBookingsToExcel,
  exportBookingsToCSV,
  exportSessionSlotsToExcel,
  exportGuideTeamBookings,
} from "../controllers/exportController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin exports
router.get("/bookings/excel", protect, authorize("admin"), exportBookingsToExcel);
router.get("/bookings/csv", protect, authorize("admin"), exportBookingsToCSV);
router.get("/session/:sessionId/excel", protect, authorize("admin"), exportSessionSlotsToExcel);

// Guide exports
router.get("/my-bookings", protect, authorize("guide"), exportGuideTeamBookings);

export default router;
