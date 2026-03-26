import express from "express";
import {
  getGuideRequests,
  getRequestDetails,
  approveRequest,
  rejectRequest,
  cancelRequest,
  getStudentBookings,
  getPendingRequests,
  getAllRequests,
} from "../controllers/requestController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student routes
router.get("/my-bookings", protect, authorize("student"), getStudentBookings);
router.delete("/:requestId/cancel", protect, authorize("student"), cancelRequest);

// Guide routes
router.get("/guide/all", protect, authorize("guide"), getGuideRequests);
router.post("/:requestId/approve", protect, authorize("guide"), approveRequest);
router.post("/:requestId/reject", protect, authorize("guide"), rejectRequest);

// Admin routes
router.get("/admin/pending", protect, authorize("admin"), getPendingRequests);
router.get("/admin/all", protect, authorize("admin"), getAllRequests);

// Public route
router.get("/:requestId", getRequestDetails);

export default router;
