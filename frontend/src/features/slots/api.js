
import { apiClient } from "../../services/apiClient";
export const requestSlot = (slotId)=> apiClient.post("/slots/request",{slotId});
export const approveRequest = (requestId)=> apiClient.post("/slots/approve",{requestId});
export const rejectRequest = (requestId)=> apiClient.post("/slots/reject",{requestId});
