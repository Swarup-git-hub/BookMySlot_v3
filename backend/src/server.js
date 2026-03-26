import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import slotRoutes from "./routes/slotRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import configRoutes from "./routes/configRoutes.js";

// 🔥 Fix for __dirname in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 🔥 Load .env from backend root
dotenv.config({
  path: path.join(__dirname, "../.env"),
});

// Express app
const app = express();
app.use(cors({
  origin: [process.env.FRONTEND_URL || "http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Socket.io setup
export const io = new Server(server, {
  cors: { 
    origin: [process.env.FRONTEND_URL || "http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  },
});

// Store connected socket users
export const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);
  
  socket.on("user-online", (userId) => {
    connectedUsers.set(userId, socket.id);
    io.emit("user-status", { userId, status: "online" });
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        io.emit("user-status", { userId, status: "offline" });
      }
    }
  });
});

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bookingslot";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/slots", slotRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/config", configRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Review Slot Booking API running ✅" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({ 
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});