// Without seedTeam.js

// ❌ User has no team → cannot book slot properly

import mongoose from "mongoose";
import User from "./models/User.js";
import Team from "./models/Team.js";

await mongoose.connect("mongodb://127.0.0.1:27017/review-slot");

// 🔍 find existing user
const user = await User.findOne({ email: "hemaswarupbande5@gmail.com" });

if (!user) {
  console.log("❌ User not found");
  process.exit();
}

// 🧱 create team
const team = await Team.create({
  name: "Team Alpha",
  members: [user._id],
});

// 🔗 link user → team
user.team = team._id;
await user.save();

console.log("✅ Team created and linked to user");

process.exit();