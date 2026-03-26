import express from "express";
import {
  sendOtp,
  verifyOtp,
  getProfile,
  createUser,
  logout,
  getAllUsers,
  deleteUser,
  initializeAdmin,
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/initialize-admin", initializeAdmin);

// Protected routes (authentication required)
router.get("/profile", protect, getProfile);
router.post("/logout", protect, logout);

// Admin routes
router.post("/users", protect, authorize("admin"), createUser);
router.get("/users", protect, authorize("admin"), getAllUsers);
router.delete("/users/:userId", protect, authorize("admin"), deleteUser);

export default router;