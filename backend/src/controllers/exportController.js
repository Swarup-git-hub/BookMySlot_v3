import ExcelJS from "exceljs";
import Request from "../models/Request.js";
import Session from "../models/Session.js";
import Slot from "../models/Slot.js";
import Team from "../models/Team.js";

// ✅ EXPORT BOOKINGS TO EXCEL
export const exportBookingsToExcel = async (req, res) => {
  try {
    const { sessionId, teamId, status } = req.query;

    let query = {};
    if (sessionId) query.session = sessionId;
    if (teamId) query.team = teamId;
    if (status) query.status = status;

    const requests = await Request.find(query)
      .populate("student", "name email")
      .populate("team", "name guide")
      .populate("session")
      .populate("slot");

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bookings");

    // Add headers
    worksheet.columns = [
      { header: "Date", key: "date", width: 12 },
      { header: "Student Name", key: "studentName", width: 20 },
      { header: "Student Email", key: "studentEmail", width: 25 },
      { header: "Team Name", key: "teamName", width: 20 },
      { header: "Time Slot", key: "timeSlot", width: 15 },
      { header: "Period", key: "period", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Request Date", key: "requestDate", width: 12 },
    ];

    // Add data
    requests.forEach((req) => {
      const date = new Date(req.session.date).toISOString().split("T")[0];
      const timeSlot = `${req.slot.startTime} - ${req.slot.endTime}`;
      const requestDate = new Date(req.createdAt).toISOString().split("T")[0];

      worksheet.addRow({
        date,
        studentName: req.student.name,
        studentEmail: req.student.email,
        teamName: req.team.name,
        timeSlot,
        period: req.slot.period.charAt(0).toUpperCase() + req.slot.period.slice(1),
        status: req.status.charAt(0).toUpperCase() + req.status.slice(1),
        requestDate,
      });
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF007bff" },
    };

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="bookings.xlsx"');

    // Send file
    await workbook.xlsx.write(res);
  } catch (err) {
    console.error("❌ Export Bookings to Excel Error:", err.message);
    res.status(500).json({ error: "Failed to export bookings" });
  }
};

// ✅ EXPORT BOOKINGS TO CSV
export const exportBookingsToCSV = async (req, res) => {
  try {
    const { sessionId, teamId, status } = req.query;

    let query = {};
    if (sessionId) query.session = sessionId;
    if (teamId) query.team = teamId;
    if (status) query.status = status;

    const requests = await Request.find(query)
      .populate("student", "name email")
      .populate("team", "name")
      .populate("session")
      .populate("slot");

    // Create CSV header
    let csv = "Date,Student Name,Student Email,Team Name,Time Slot,Period,Status,Request Date\n";

    // Add rows
    requests.forEach((req) => {
      const date = new Date(req.session.date).toISOString().split("T")[0];
      const timeSlot = `${req.slot.startTime}-${req.slot.endTime}`;
      const requestDate = new Date(req.createdAt).toISOString().split("T")[0];

      csv += `${date},"${req.student.name}","${req.student.email}","${req.team.name}","${timeSlot}","${req.slot.period}","${req.status}","${requestDate}"\n`;
    });

    // Set response headers
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="bookings.csv"');

    // Send CSV
    res.send(csv);
  } catch (err) {
    console.error("❌ Export Bookings to CSV Error:", err.message);
    res.status(500).json({ error: "Failed to export bookings" });
  }
};

// ✅ EXPORT SESSION SLOTS TO EXCEL
export const exportSessionSlotsToExcel = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const slots = await Slot.find({ session: sessionId })
      .populate("bookingStatus.team", "name")
      .sort({ period: 1, slotNumber: 1 });

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Session Slots");

    // Add headers
    worksheet.columns = [
      { header: "Period", key: "period", width: 15 },
      { header: "Slot Number", key: "slotNumber", width: 12 },
      { header: "Start Time", key: "startTime", width: 12 },
      { header: "End Time", key: "endTime", width: 12 },
      { header: "Status", key: "status", width: 12 },
      { header: "Booked By", key: "bookedBy", width: 20 },
      { header: "Disabled", key: "isDisabled", width: 10 },
    ];

    // Add data
    slots.forEach((slot) => {
      worksheet.addRow({
        period: slot.period.charAt(0).toUpperCase() + slot.period.slice(1),
        slotNumber: slot.slotNumber,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status.charAt(0).toUpperCase() + slot.status.slice(1),
        bookedBy: slot.bookingStatus?.team?.name || "-",
        isDisabled: slot.isDisabled ? "Yes" : "No",
      });
    });

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF007bff" },
    };

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${formatDate(session.date)}-slots.xlsx"`);

    // Send file
    await workbook.xlsx.write(res);
  } catch (err) {
    console.error("❌ Export Session Slots to Excel Error:", err.message);
    res.status(500).json({ error: "Failed to export session slots" });
  }
};

// ✅ EXPORT GUIDE TEAM BOOKINGS
export const exportGuideTeamBookings = async (req, res) => {
  try {
    const guideId = req.user.id;
    const format = req.query.format || "xlsx";

    // Get guide's teams
    const teams = await Team.find({ guide: guideId });
    const teamIds = teams.map(t => t._id);

    // Get bookings
    const requests = await Request.find({ team: { $in: teamIds } })
      .populate("student", "name email")
      .populate("team", "name")
      .populate("session")
      .populate("slot");

    if (format === "csv") {
      // CSV export
      let csv = "Date,Student Name,Student Email,Team Name,Time Slot,Period,Status\n";

      requests.forEach((req) => {
        const date = new Date(req.session.date).toISOString().split("T")[0];
        const timeSlot = `${req.slot.startTime}-${req.slot.endTime}`;

        csv += `${date},"${req.student.name}","${req.student.email}","${req.team.name}","${timeSlot}","${req.slot.period}","${req.status}"\n`;
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="team-bookings.csv"');
      res.send(csv);
    } else {
      // Excel export
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Team Bookings");

      worksheet.columns = [
        { header: "Date", key: "date", width: 12 },
        { header: "Student Name", key: "studentName", width: 20 },
        { header: "Student Email", key: "studentEmail", width: 25 },
        { header: "Team Name", key: "teamName", width: 20 },
        { header: "Time Slot", key: "timeSlot", width: 15 },
        { header: "Period", key: "period", width: 12 },
        { header: "Status", key: "status", width: 12 },
      ];

      requests.forEach((req) => {
        const date = new Date(req.session.date).toISOString().split("T")[0];
        const timeSlot = `${req.slot.startTime} - ${req.slot.endTime}`;

        worksheet.addRow({
          date,
          studentName: req.student.name,
          studentEmail: req.student.email,
          teamName: req.team.name,
          timeSlot,
          period: req.slot.period,
          status: req.status,
        });
      });

      worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF007bff" },
      };

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", 'attachment; filename="team-bookings.xlsx"');

      await workbook.xlsx.write(res);
    }
  } catch (err) {
    console.error("❌ Export Guide Team Bookings Error:", err.message);
    res.status(500).json({ error: "Failed to export team bookings" });
  }
};

// Helper to format date
const formatDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};
