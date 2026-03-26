import Team from "../models/Team.js";
import User from "../models/User.js";

// ✅ CREATE TEAM (ADMIN)
export const createTeam = async (req, res) => {
  try {
    const { name, guideId, description, maxMembers } = req.body;

    if (!name || !guideId) {
      return res.status(400).json({ error: "Name and guide ID are required" });
    }

    // Verify guide exists and is a guide
    const guide = await User.findById(guideId);
    if (!guide || guide.role !== "guide") {
      return res.status(404).json({ error: "Guide not found" });
    }

    // Check if team name exists
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(409).json({ error: "Team name already exists" });
    }

    const newTeam = new Team({
      name,
      guide: guideId,
      description,
      maxMembers: maxMembers || 4,
      createdBy: req.user.id,
    });

    await newTeam.save();

    res.status(201).json({ message: "Team created successfully", team: newTeam });
  } catch (err) {
    console.error("❌ Create Team Error:", err.message);
    res.status(500).json({ error: "Failed to create team" });
  }
};

// ✅ GET ALL TEAMS
export const getAllTeams = async (req, res) => {
  try {
    const { guideId, isActive } = req.query;

    let query = {};
    if (guideId) query.guide = guideId;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const teams = await Team.find(query)
      .populate("guide", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.json({ teams, count: teams.length });
  } catch (err) {
    console.error("❌ Get All Teams Error:", err.message);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
};

// ✅ GET GUIDE'S TEAMS
export const getGuidesTeams = async (req, res) => {
  try {
    const guideId = req.user.id;

    const teams = await Team.find({ guide: guideId })
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.json({ teams, count: teams.length });
  } catch (err) {
    console.error("❌ Get Guide's Teams Error:", err.message);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
};

// ✅ GET TEAM DETAILS
export const getTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId)
      .populate("guide", "name email")
      .populate("members", "name email");

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.json({ team });
  } catch (err) {
    console.error("❌ Get Team Details Error:", err.message);
    res.status(500).json({ error: "Failed to fetch team details" });
  }
};

// ✅ ADD STUDENT TO TEAM
export const addStudentToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { studentId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ 
        error: `Team is full (max ${team.maxMembers} members)` 
      });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    if (student.team) {
      return res.status(400).json({ error: "Student already in another team" });
    }

    if (team.members.includes(studentId)) {
      return res.status(400).json({ error: "Student already in this team" });
    }

    // Add student to team
    team.members.push(studentId);
    await team.save();

    // Update student's team
    student.team = teamId;
    await student.save();

    res.json({ message: "Student added to team", team });
  } catch (err) {
    console.error("❌ Add Student to Team Error:", err.message);
    res.status(500).json({ error: "Failed to add student to team" });
  }
};

// ✅ REMOVE STUDENT FROM TEAM
export const removeStudentFromTeam = async (req, res) => {
  try {
    const { teamId, studentId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const index = team.members.indexOf(studentId);
    if (index === -1) {
      return res.status(400).json({ error: "Student not in this team" });
    }

    // Remove student from team
    team.members.splice(index, 1);
    await team.save();

    // Update student's team
    const student = await User.findById(studentId);
    student.team = null;
    await student.save();

    res.json({ message: "Student removed from team", team });
  } catch (err) {
    console.error("❌ Remove Student from Team Error:", err.message);
    res.status(500).json({ error: "Failed to remove student from team" });
  }
};

// ✅ UPDATE TEAM
export const updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, description, maxMembers, isActive } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    if (name) team.name = name;
    if (description) team.description = description;
    if (maxMembers) team.maxMembers = maxMembers;
    if (isActive !== undefined) team.isActive = isActive;

    await team.save();

    res.json({ message: "Team updated successfully", team });
  } catch (err) {
    console.error("❌ Update Team Error:", err.message);
    res.status(500).json({ error: "Failed to update team" });
  }
};

// ✅ DELETE TEAM
export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    const team = await Team.findByIdAndDelete(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Remove team reference from students
    await User.updateMany(
      { team: teamId },
      { $set: { team: null } }
    );

    res.json({ message: "Team deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Team Error:", err.message);
    res.status(500).json({ error: "Failed to delete team" });
  }
};
