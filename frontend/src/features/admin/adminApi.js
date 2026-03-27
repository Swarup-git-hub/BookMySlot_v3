import apiClient from "../../services/apiClient.js";

// ✅ USER MANAGEMENT
export const createUser = async (userData) => {
  const response = await apiClient.post("/auth/users", userData);
  return response.data;
};

export const getAllUsers = async (params) => {
  const response = await apiClient.get("/auth/users", { params });
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await apiClient.put(`/auth/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await apiClient.delete(`/auth/users/${userId}`);
  return response.data;
};

export const getUser = async (userId) => {
  const response = await apiClient.get(`/auth/users/${userId}`);
  return response.data;
};

export const getUsersByRole = async (role) => {
  const response = await apiClient.get("/auth/users", { params: { role } });
  return response.data;
};

export const searchUsers = async (search) => {
  const response = await apiClient.get("/auth/users", { params: { search } });
  return response.data;
};

// ✅ TEAM MANAGEMENT
export const createTeam = async (teamData) => {
  const response = await apiClient.post("/teams", teamData);
  return response.data;
};

export const getAllTeams = async (params) => {
  const response = await apiClient.get("/teams", { params });
  return response.data;
};

export const getTeamDetails = async (teamId) => {
  const response = await apiClient.get(`/teams/${teamId}`);
  return response.data;
};

export const updateTeam = async (teamId, teamData) => {
  const response = await apiClient.patch(`/teams/${teamId}`, teamData);
  return response.data;
};

export const deleteTeam = async (teamId) => {
  const response = await apiClient.delete(`/teams/${teamId}`);
  return response.data;
};

export const addStudentToTeam = async (teamId, studentId) => {
  const response = await apiClient.post(`/teams/${teamId}/add-student`, { studentId });
  return response.data;
};

export const removeStudentFromTeam = async (teamId, studentId) => {
  const response = await apiClient.delete(`/teams/${teamId}/remove-student/${studentId}`);
  return response.data;
};

export const getTeamsByGuide = async (guideId) => {
  const response = await apiClient.get("/teams", { params: { guideId } });
  return response.data;
};

// ✅ SESSION MANAGEMENT
export const createSession = async (sessionData) => {
  const response = await apiClient.post("/admin/sessions", sessionData);
  return response.data;
};

export const getAllSessions = async (params) => {
  const response = await apiClient.get("/admin/sessions", { params });
  return response.data;
};

export const getSessionDetails = async (sessionId) => {
  const response = await apiClient.get(`/admin/sessions/${sessionId}`);
  return response.data;
};

export const updateSession = async (sessionId, sessionData) => {
  const response = await apiClient.patch(`/admin/sessions/${sessionId}`, sessionData);
  return response.data;
};

export const deleteSession = async (sessionId) => {
  const response = await apiClient.delete(`/admin/sessions/${sessionId}`);
  return response.data;
};

export const getUpcomingSessions = async () => {
  const response = await apiClient.get("/admin/session/upcoming");
  return response.data;
};

// ✅ CONFIGURATION
export const getConfiguration = async () => {
  const response = await apiClient.get("/admin/config");
  return response.data;
};

export const updateConfiguration = async (configData) => {
  const response = await apiClient.patch("/admin/config", configData);
  return response.data;
};

// ✅ DASHBOARD STATS
export const getDashboardStats = async () => {
  const response = await apiClient.get("/admin/dashboard/stats");
  return response.data;
};

// ✅ BULK OPERATIONS
export const bulkCreateUsers = async (usersData) => {
  const results = [];
  for (const userData of usersData) {
    try {
      const result = await createUser(userData);
      results.push({ success: true, data: result });
    } catch (error) {
      results.push({ success: false, error: error.response?.data?.error || error.message, data: userData });
    }
  }
  return results;
};

export const bulkCreateTeams = async (teamsData) => {
  const results = [];
  for (const teamData of teamsData) {
    try {
      const result = await createTeam(teamData);
      results.push({ success: true, data: result });
    } catch (error) {
      results.push({ success: false, error: error.response?.data?.error || error.message, data: teamData });
    }
  }
  return results;
};
