import apiClient from "../../services/apiClient.js";

// ✅ REQUEST SLOT
export const requestSlot = async (slotId) => {
  const response = await apiClient.post("/slots/request", { slotId });
  return response.data;
};

// ✅ GET SLOTS BY SESSION
export const getSlotsBySession = async (sessionId, params) => {
  const response = await apiClient.get(`/slots/session/${sessionId}`, { params });
  return response.data;
};

// ✅ GET AVAILABLE SLOTS
export const getAvailableSlots = async (sessionId) => {
  const response = await apiClient.get(`/slots/session/${sessionId}/available`);
  return response.data;
};

// ✅ GET BOOKING SUMMARY
export const getBookingSummary = async (sessionId) => {
  const response = await apiClient.get(`/slots/session/${sessionId}/summary`);
  return response.data;
};

// ✅ GET SLOT DETAILS
export const getSlotDetails = async (slotId) => {
  const response = await apiClient.get(`/slots/${slotId}`);
  return response.data;
};

// ✅ GENERATE SLOTS (ADMIN)
export const generateSlots = async (sessionId) => {
  const response = await apiClient.post(`/slots/session/${sessionId}/generate`);
  return response.data;
};

// ✅ TOGGLE SLOT STATUS (ADMIN)
export const toggleSlotStatus = async (slotId, data) => {
  const response = await apiClient.patch(`/slots/${slotId}/toggle`, data);
  return response.data;
};

// ✅ GET GUIDE REQUESTS
export const getGuideRequests = async () => {
  const response = await apiClient.get("/requests/guide/all");
  return response.data;
};

// ✅ APPROVE REQUEST
export const approveRequest = async (requestId) => {
  const response = await apiClient.post(`/requests/${requestId}/approve`);
  return response.data;
};

// ✅ REJECT REQUEST
export const rejectRequest = async (requestId, reason) => {
  const response = await apiClient.post(`/requests/${requestId}/reject`, { reason });
  return response.data;
};

// ✅ CANCEL REQUEST
export const cancelRequest = async (requestId) => {
  const response = await apiClient.delete(`/requests/${requestId}/cancel`);
  return response.data;
};

// ✅ GET STUDENT BOOKINGS
export const getStudentBookings = async () => {
  const response = await apiClient.get("/requests/my-bookings");
  return response.data;
};

// ✅ GET PENDING REQUESTS (ADMIN)
export const getPendingRequests = async () => {
  const response = await apiClient.get("/requests/admin/pending");
  return response.data;
};

// ✅ GET ALL REQUESTS (ADMIN)
export const getAllRequests = async (params) => {
  const response = await apiClient.get("/requests/admin/all", { params });
  return response.data;
};
