import apiClient from "../../services/apiClient.js";

// ✅ TEAM MANAGEMENT (ADMIN)
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

// ✅ GUIDE TEAMS
export const getGuidesTeams = async () => {
  const response = await apiClient.get("/teams/guide/teams");
  return response.data;
};
