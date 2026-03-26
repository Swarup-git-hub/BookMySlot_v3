import React, { useEffect, useState } from "react";
import { apiClient } from "../../services/apiClient";
import useUser from "../../hooks/useUser";

export default function SlotGrid() {
  const [slots, setSlots] = useState([]);
  const user = useUser(); // 🔥 real user

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    const res = await apiClient.get("/slots");
    setSlots(res.data);
  };

  const requestSlot = async (slot) => {
    // 🔒 Ensure user loaded
    if (!user || !user.team) {
      alert("User not loaded yet. Please wait.");
      return;
    }

    // ✅ Confirm UX
    const confirm = window.confirm(`Book slot at ${slot.time}?`);
    if (!confirm) return;

    try {
      await apiClient.post("/slots/request", {
        slotId: slot._id,
        userId: user._id,           // ✅ real user
        teamId: user.team._id,      // ✅ real team
      });

      alert("Slot requested");

      fetchSlots(); // refresh UI

    } catch (err) {
      alert(err.response?.data?.message || "Error booking slot");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Slots</h2>

      <div className="grid grid-cols-4 gap-4">
        {slots.map((slot) => (
          <div
            key={slot._id}
            onClick={() =>
              slot.status === "available" && requestSlot(slot)
            }
            className={`p-4 rounded text-white cursor-pointer transition ${
              slot.status === "available"
                ? "bg-green-500 hover:bg-green-600"
                : slot.status === "pending"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          >
            <p className="font-semibold">{slot.time}</p>
            <p className="text-sm capitalize">{slot.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}