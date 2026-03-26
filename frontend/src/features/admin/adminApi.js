import apiClient from "../../services/apiClient.js";

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
