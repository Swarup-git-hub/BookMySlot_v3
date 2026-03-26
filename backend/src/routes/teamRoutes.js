import express from "express";
import {
  createTeam,
  getAllTeams,
  getGuidesTeams,
  getTeamDetails,
  addStudentToTeam,
  removeStudentFromTeam,
  updateTeam,
  deleteTeam,
} from "../controllers/teamController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes
router.post("/", protect, authorize("admin"), createTeam);
router.get("/", protect, authorize("admin"), getAllTeams);
router.patch("/:teamId", protect, authorize("admin"), updateTeam);
router.delete("/:teamId", protect, authorize("admin"), deleteTeam);
router.post("/:teamId/add-student", protect, authorize("admin"), addStudentToTeam);
router.delete("/:teamId/remove-student/:studentId", protect, authorize("admin"), removeStudentFromTeam);

// Guide routes
router.get("/guide/teams", protect, authorize("guide"), getGuidesTeams);

// Public route
router.get("/:teamId", getTeamDetails);

export default router;
