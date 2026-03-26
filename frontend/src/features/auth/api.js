
import { apiClient } from "../../services/apiClient";
export const sendOtp = (email)=> apiClient.post("/auth/send-otp",{email});
export const verifyOtp = (data)=> apiClient.post("/auth/verify-otp",data);
