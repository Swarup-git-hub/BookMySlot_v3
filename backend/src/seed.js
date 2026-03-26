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

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/review-slot";

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
    const guides = await User.insertMany([
      {
        name: "Dr. Rajesh Kumar",
        email: "tabid3377@gmail.com",
        role: "guide",
        isActive: true,
        createdBy: admin._id,
      },
      {
        name: "Prof. Priya Sharma",
        email: "priya.guide@example.com",
        role: "guide",
        isActive: true,
        createdBy: admin._id,
      },
      {
        name: "Dr. Amit Patel",
        email: "amit.guide@example.com",
        role: "guide",
        isActive: true,
        createdBy: admin._id,
      },
    ]);
    console.log("✅ Created", guides.length, "guides");

    // Create Teams and Students
    const teams = [];
    const students = [];

    for (let g = 0; g < guides.length; g++) {
      const guide = guides[g];

      // Create 3 teams per guide
      for (let t = 0; t < 3; t++) {
        const teamName = `Team ${String.fromCharCode(65 + t)} - Guide ${g + 1}`;

        // Create students for this team
        const teamStudents = [];
        for (let s = 0; s < 4; s++) {
          const student = await User.create({
            name: `Student ${g * 3 * 4 + t * 4 + s + 1}`,
            email: `student${g * 3 * 4 + t * 4 + s + 1}@example.com`,
            role: "student",
            isActive: true,
            createdBy: admin._id,
          });
          teamStudents.push(student._id);
          students.push(student);
        }

        // Create team
        const team = await Team.create({
          name: teamName,
          guide: guide._id,
          members: teamStudents,
          maxMembers: 5,
          createdBy: admin._id,
        });

        // Update students' team reference
        await User.updateMany(
          { _id: { $in: teamStudents } },
          { $set: { team: team._id } }
        );

        teams.push(team);
      }
    }

    console.log("✅ Created", teams.length, "teams with", students.length, "students");

    // Create Sessions
    const sessions = [];
    const sessionsToCreate = 7;

    for (let i = 0; i < sessionsToCreate; i++) {
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
        totalSlots: 10,
      });

      sessions.push(session);
    }

    console.log("✅ Created", sessions.length, "sessions");

    // Generate Slots for Sessions
    for (const session of sessions) {
      const { configuration } = session;
      const slots = [];

      // Forenoon slots
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

      // Afternoon slots
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

    console.log("✅ Generated slots for all sessions");

    // Create Default Configuration
    await Config.updateOne(
      { configName: "default" },
      {
        $set: {
          session: {
            forenoon: {
              startTime: "09:00",
              endTime: "13:00",
              slotCount: 5,
            },
            afternoon: {
              startTime: "14:00",
              endTime: "18:00",
              slotCount: 5,
            },
          },
          slotDuration: 30,
          team: {
            minStudents: 1,
            maxStudents: 5,
            guideCanManage: 4,
          },
          otp: {
            expiryMinutes: 5,
            maxRequests: 5,
          },
          features: {
            realTimeUpdates: true,
            darkMode: true,
            excelExport: true,
            csvExport: true,
          },
        },
      },
      { upsert: true }
    );

    console.log("✅ Configuration created");

    console.log("\n========== SEED DATA SUMMARY ==========");
    console.log("✅ Admin:", admin.email);
    console.log("✅ Guides:", guides.length);
    console.log("✅ Teams:", teams.length);
    console.log("✅ Students:", students.length);
    console.log("✅ Sessions:", sessions.length);
    console.log("✅ Total Slots:", sessions.length * 10);
    console.log("=======================================\n");

    console.log("📝 Login Credentials:");
    console.log("Admin:", admin.email);
    guides.slice(0, 2).forEach((g, i) => {
      console.log(`Guide ${i + 1}:`, g.email);
    });
    students.slice(0, 3).forEach((s, i) => {
      console.log(`Student ${i + 1}:`, s.email);
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed Error:", err.message);
    process.exit(1);
  }
};

seed();
