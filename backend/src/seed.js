import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import User from "./models/User.js";
import Team from "./models/Team.js";
import Session from "./models/Session.js";
import Slot from "./models/Slot.js";
import Config from "./models/Config.js";
import { addMinutesToTime } from "./utils/helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.join(__dirname, "../.env"),
});

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bookingslot";

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Session.deleteMany({}),
      Slot.deleteMany({}),
    ]);
    console.log("🗑️ Cleared existing data");

    // Create Admin
    const admin = await User.create({
      name: "Admin",
      email: process.env.ADMIN_EMAIL,
      role: "admin",
      isActive: true,
    });
    console.log("✅ Admin created:", admin.email);

    // Create Guides
    const guide1 = await User.create({
      name: "Dr. Rajesh Kumar",
      email: "tabid3377@gmail.com",
      role: "guide",
      isActive: true,
      createdBy: admin._id,
    });
    const guide2 = await User.create({
      name: "Prof. Priya Sharma",
      email: "priya.guide@example.com",
      role: "guide",
      isActive: true,
      createdBy: admin._id,
    });
    const guide3 = await User.create({
      name: "Dr. Amit Patel",
      email: "amit.guide@example.com",
      role: "guide",
      isActive: true,
      createdBy: admin._id,
    });
    console.log("✅ Created 3 guides");

    // Create 5 Fixed Students
    const student1 = await User.create({
      name: "Bhargav Pasupuleti",
      email: "bhargavpasupuleti5@gmail.com",
      role: "student",
      isActive: true,
      createdBy: admin._id,
    });
    const student2 = await User.create({
      name: "Student 2",
      email: "student2@example.com",
      role: "student",
      isActive: true,
      createdBy: admin._id,
    });
    const student3 = await User.create({
      name: "Student 3",
      email: "student3@example.com",
      role: "student",
      isActive: true,
      createdBy: admin._id,
    });
    const student4 = await User.create({
      name: "Student 4",
      email: "student4@example.com",
      role: "student",
      isActive: true,
      createdBy: admin._id,
    });
    const student5 = await User.create({
      name: "Student 5",
      email: "student5@example.com",
      role: "student",
      isActive: true,
      createdBy: admin._id,
    });
    console.log("✅ Created 5 students (bhargavpasupuleti5@gmail.com is Student1)");

    // Create Teams
    const team1 = await Team.create({
      name: "Team A",
      guide: guide1._id,
      members: [student1._id, student2._id, student3._id],
      maxMembers: 5,
      createdBy: admin._id,
    });
    const team2 = await Team.create({
      name: "Team B",
      guide: guide2._id,
      members: [student4._id, student5._id],
      maxMembers: 5,
      createdBy: admin._id,
    });
    console.log("✅ Created 2 teams");

    // Update student teams
    await User.updateMany(
      { _id: { $in: [student1._id, student2._id, student3._id, student4._id, student5._id] } },
      { $set: { team: team1._id } }
    );

    // Create Sessions (7 days)
    const sessions = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const session = await Session.create({
        date,
        configuration: {
          forenoon: {
            startTime: "09:00",
            endTime: "13:00",
            slots: 5,
          },
          afternoon: {
            startTime: "14:00",
            endTime: "18:00",
            slots: 5,
          },
          slotDuration: 30,
        },
      });
      sessions.push(session);
    }
    console.log("✅ Created 7 sessions");

    // Generate Slots
    for (const session of sessions) {
      const { configuration } = session;
      const slots = [];

      // Forenoon (5 slots)
      let lastEndTime = configuration.forenoon.startTime;
      for (let i = 1; i <= configuration.forenoon.slots; i++) {
        const startTime = lastEndTime;
        const endTime = addMinutesToTime(startTime, configuration.slotDuration);
        slots.push({
          session: session._id,
          period: "forenoon",
          slotNumber: i,
          startTime,
          endTime,
          status: "available",
          isDisabled: false,
        });
        lastEndTime = endTime;
      }

      // Afternoon (5 slots)
      lastEndTime = configuration.afternoon.startTime;
      for (let i = 1; i <= configuration.afternoon.slots; i++) {
        const startTime = lastEndTime;
        const endTime = addMinutesToTime(startTime, configuration.slotDuration);
        slots.push({
          session: session._id,
          period: "afternoon",
          slotNumber: i,
          startTime,
          endTime,
          status: "available",
          isDisabled: false,
        });
        lastEndTime = endTime;
      }

      await Slot.insertMany(slots);
    }
    console.log("✅ Generated 70 slots (10 per session)");

    // Default Config
    await Config.updateOne(
      { configName: "default" },
      {
        $set: {
          session: {
            forenoon: { startTime: "09:00", endTime: "13:00", slotCount: 5 },
            afternoon: { startTime: "14:00", endTime: "18:00", slotCount: 5 },
          },
          slotDuration: 30,
          team: { minStudents: 1, maxStudents: 5, guideCanManage: 4 },
          otp: { expiryMinutes: 5, maxRequests: 5 },
          features: { realTimeUpdates: true, darkMode: true, excelExport: true, csvExport: true },
        },
      },
      { upsert: true }
    );

    console.log("✅ Seed Complete!");
    console.log("\nLogin:");
    console.log("Admin: " + admin.email);
    console.log("Student: bhargavpasupuleti5@gmail.com");
    console.log("Guides: tabid3377@gmail.com, priya.guide@example.com");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Error:", err.message);
    process.exit(1);
  }
};

seed();

