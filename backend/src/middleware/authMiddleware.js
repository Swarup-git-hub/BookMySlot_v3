import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Not authorized - no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      team: user.team,
    };
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Role-based access control middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required role: ${roles.join(" or ")}` 
      });
    }

    next();
  };
};

// Middleware to verify team ownership for guides
export const verifyGuideTeamOwnership = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const Team = (await import("../models/Team.js")).default;

    const team = await Team.findById(teamId);

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (team.guide.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to manage this team" });
    }

    req.team = team;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
