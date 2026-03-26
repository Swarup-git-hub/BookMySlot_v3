// Generate random OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT token
export const generateToken = (userId, role) => {
  const jwt = require("jsonwebtoken");
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Format time to HH:MM
export const formatTime = (hours, minutes) => {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// Add minutes to a time string
export const addMinutesToTime = (timeStr, minutes) => {
  const [hours, mins] = timeStr.split(":").map(Number);
  let newMins = mins + minutes;
  let newHours = hours;

  if (newMins >= 60) {
    newHours += Math.floor(newMins / 60);
    newMins = newMins % 60;
  }

  return formatTime(newHours, newMins);
};

// Check if two time ranges overlap
export const timesOverlap = (start1, end1, start2, end2) => {
  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const start1Min = toMinutes(start1);
  const end1Min = toMinutes(end1);
  const start2Min = toMinutes(start2);
  const end2Min = toMinutes(end2);

  return start1Min < end2Min && start2Min < end1Min;
};

// Convert date to string format (YYYY-MM-DD)
export const formatDate = (date) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return date.toISOString().split("T")[0];
};

// Get start of day
export const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Get end of day
export const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};
