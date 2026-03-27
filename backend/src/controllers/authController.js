import User from "../models/User.js";
import Team from "../models/Team.js";
import { sendOTP } from "../services/mailService.js";
import jwt from "jsonwebtoken";

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ✅ SEND OTP
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(404).json({ error: "User not found or inactive" });
    }

    // Check rate limiting
    const lastOtpTime = user.lastOtpRequestTime;
    if (lastOtpTime && Date.now() - lastOtpTime < 60000) {
      return res.status(429).json({ error: "Please wait 1 minute before requesting another OTP" });
    }

    if (user.otpAttempts >= parseInt(process.env.MAX_OTP_REQUESTS || 5)) {
      return res.status(429).json({ error: "Too many OTP requests. Try again later." });
    }

    const otp = generateOTP();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES || 5) * 60 * 1000);
    user.otpAttempts = (user.otpAttempts || 0) + 1;
    user.lastOtpRequestTime = new Date();
    await user.save();

    // Send email
    await sendOTP(email, otp, user.name);

    res.json({ 
      message: "OTP sent successfully",
      expiresIn: `${process.env.OTP_EXPIRY_MINUTES || 5} minutes`
    });
  } catch (err) {
    console.error("❌ OTP Error:", err.message);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// ✅ VERIFY OTP & LOGIN
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP required" });
    }

    const user = await User.findOne({ email, isActive: true });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpiry) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ error: "OTP expired" });
    }

    // Clear OTP and reset attempts
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Populate team info
    let teamInfo = null;
    if (user.team) {
      teamInfo = await Team.findById(user.team).select("name guide");
    }

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team: teamInfo,
      },
    });
  } catch (err) {
    console.error("❌ Verify OTP Error:", err.message);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

// ✅ GET CURRENT USER PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-otp -otpExpiry -otpAttempts")
      .populate("team");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("❌ Get Profile Error:", err.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// ✅ CREATE USER (ADMIN ONLY)
export const createUser = async (req, res) => {
  try {
    const { name, email, role, team } = req.body;

    // Validate input
    if (!name || !email || !role) {
      return res.status(400).json({ error: "Name, email, and role are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      role,
      team: role === "student" ? team : null,
      createdBy: req.user.id,
    });

    await newUser.save();

    res.status(201).json({ 
      message: "User created successfully",
      user: newUser 
    });
  } catch (err) {
    console.error("❌ Create User Error:", err.message);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// ✅ LOGOUT
export const logout = async (req, res) => {
  try {
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("❌ Logout Error:", err.message);
    res.status(500).json({ error: "Logout failed" });
  }
};

// ✅ GET ALL USERS (ADMIN ONLY)
export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;

    let query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];

    const users = await User.find(query)
      .select("-otp -otpExpiry -otpAttempts")
      .populate("team")
      .limit(100);

    res.json({ users, count: users.length });
  } catch (err) {
    console.error("❌ Get All Users Error:", err.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// ✅ DELETE USER (ADMIN ONLY)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Delete User Error:", err.message);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// ✅ INITIALIZE ADMIN (First time setup)
export const initializeAdmin = async (req, res) => {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ role: "admin" });

    if (adminExists) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    const admin = new User({
      name: "Admin",
      email: process.env.ADMIN_EMAIL,
      role: "admin",
      isActive: true,
    });

    await admin.save();

    res.status(201).json({ 
      message: "Admin created successfully",
      admin 
    });
  } catch (err) {
    console.error("❌ Initialize Admin Error:", err.message);
    res.status(500).json({ error: "Failed to initialize admin" });
  }
};

// ✅ UPDATE USER (ADMIN ONLY)
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role, team, isActive } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate email uniqueness if changed
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: "Email already in use" });
      }
      user.email = email;
    }

    // Update fields
    if (name) user.name = name;
    if (role && role !== user.role) {
      user.role = role;
      // If changing to guide, clear team
      if (role === "guide") user.team = null;
    }
    if (role === "student" && team) {
      user.team = team;
    }
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.json({
      message: "User updated successfully",
      user: user
    });
  } catch (err) {
    console.error("❌ Update User Error:", err.message);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// ✅ GET CURRENT USER
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("team");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    console.log("GetMe Error:", err.message);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};