
import { useEffect } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useSocket = (onUpdate) => {
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection events
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Slot events
    socket.on("slots-generated", (data) => {
      console.log("📌 Slots generated:", data);
      if (onUpdate) onUpdate("slots-generated", data);
    });

    socket.on("slot-status-changed", (data) => {
      console.log("📌 Slot status changed:", data);
      if (onUpdate) onUpdate("slot-status-changed", data);
    });

    socket.on("slotUpdated", (data) => {
      console.log("📌 Slot updated:", data);
      if (onUpdate) onUpdate("slotUpdated", data);
    });

    // Request events
    socket.on("new-slot-request", (data) => {
      console.log("📌 New slot request:", data);
      if (onUpdate) onUpdate("new-slot-request", data);
    });

    socket.on("request-approved", (data) => {
      console.log("📌 Request approved:", data);
      if (onUpdate) onUpdate("request-approved", data);
    });

    socket.on("request-rejected", (data) => {
      console.log("📌 Request rejected:", data);
      if (onUpdate) onUpdate("request-rejected", data);
    });

    socket.on("request-cancelled", (data) => {
      console.log("📌 Request cancelled:", data);
      if (onUpdate) onUpdate("request-cancelled", data);
    });

    // User status events
    socket.on("user-status", (data) => {
      console.log("📌 User status:", data);
      if (onUpdate) onUpdate("user-status", data);
    });

    return () => {
      socket.disconnect();
    };
  }, [onUpdate]);
};
