import nodemailer from "nodemailer";

// Create transporter instance
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

// Send OTP email
export const sendOTP = async (email, otp, name = "User") => {
  try {
    const transporter = createTransporter();

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Review Slot Booking System</h2>
        <p>Hi ${name},</p>
        <p>Your OTP for login is:</p>
        <h1 style="color: #007bff; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP is valid for 5 minutes only.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
        <hr>
        <p><small>© Review Slot Booking System</small></p>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"Review Slot Booking" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🔐 Your Login OTP",
      html: htmlTemplate,
      text: `Your OTP is: ${otp}\nThis OTP is valid for 5 minutes only.`,
    });

    console.log("✅ OTP sent to:", email);
    return info;
  } catch (err) {
    console.error("❌ Mail error:", err.message);
    throw new Error(`Failed to send OTP: ${err.message}`);
  }
};

// Send approval notification
export const sendApprovalNotification = async (guideEmail, guideName, teamName, slotTime) => {
  try {
    const transporter = createTransporter();

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>📅 Slot Booking Approved</h2>
        <p>Hi ${guideName},</p>
        <p>A slot booking request has been approved:</p>
        <ul>
          <li><strong>Team:</strong> ${teamName}</li>
          <li><strong>Time Slot:</strong> ${slotTime}</li>
        </ul>
        <p>Please log in to the system for more details.</p>
        <hr>
        <p><small>© Review Slot Booking System</small></p>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Review Slot Booking" <${process.env.EMAIL_USER}>`,
      to: guideEmail,
      subject: "📅 Slot Booking Approved",
      html: htmlTemplate,
    });

    console.log("✅ Approval notification sent to:", guideEmail);
  } catch (err) {
    console.error("❌ Mail error:", err.message);
  }
};

// Send request notification to guide
export const sendRequestNotification = async (guideEmail, guideName, studentName, teamName) => {
  try {
    const transporter = createTransporter();

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>🔔 New Slot Request</h2>
        <p>Hi ${guideName},</p>
        <p><strong>${studentName}</strong> from <strong>${teamName}</strong> has requested a slot booking.</p>
        <p>Please log in to the system to review and approve/reject the request.</p>
        <hr>
        <p><small>© Review Slot Booking System</small></p>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Review Slot Booking" <${process.env.EMAIL_USER}>`,
      to: guideEmail,
      subject: "🔔 New Slot Request - Action Required",
      html: htmlTemplate,
    });

    console.log("✅ Request notification sent to:", guideEmail);
  } catch (err) {
    console.error("❌ Mail error:", err.message);
  }
};

export default { sendOTP, sendApprovalNotification, sendRequestNotification };