import apiClient from "../../services/apiClient.js";

// ✅ SEND OTP
export const sendOTP = async (email) => {
  const response = await apiClient.post("/auth/send-otp", { email });
  return response.data;
};

// ✅ VERIFY OTP & LOGIN
export const verifyOTP = async (email, otp) => {
  const response = await apiClient.post("/auth/verify-otp", { email, otp });
  return response.data;
};

// ✅ GET PROFILE
export const getProfile = async () => {
  const response = await apiClient.get("/auth/profile");
  return response.data;
};

// ✅ LOGOUT
export const logout = async () => {
  const response = await apiClient.post("/auth/logout");
  return response.data;
};

// ✅ GET ALL USERS (ADMIN)
export const getAllUsers = async (params) => {
  const response = await apiClient.get("/auth/users", { params });
  return response.data;
};

// ✅ CREATE USER (ADMIN)
export const createUser = async (userData) => {
  const response = await apiClient.post("/auth/users", userData);
  return response.data;
};

// ✅ DELETE USER (ADMIN)
export const deleteUser = async (userId) => {
  const response = await apiClient.delete(`/auth/users/${userId}`);
  return response.data;
};
