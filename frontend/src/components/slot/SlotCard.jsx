// // import React from "react";
// export default function SlotCard({slot,onClick}){
//   const m = {available:"bg-green-500",pending:"bg-yellow-500",booked:"bg-red-500",disabled:"bg-gray-400"};
//   return (
//     <div onClick={()=>onClick(slot)} className={`p-4 rounded text-white cursor-pointer ${m[slot.status]}`}>
//       <div className="font-semibold">{slot.time}</div>
//       <div className="text-sm">{slot.status}</div>
//     </div>
//   );
// }
export default function SlotCard({ slot, onClick }) {
  const styles = {
    available: "bg-green-500 hover:scale-105 cursor-pointer",
    pending: "bg-yellow-500",
    booked: "bg-red-500",
    disabled: "bg-gray-400 cursor-not-allowed",
  };

  return (
    <div
      onClick={() => slot.status === "available" && onClick(slot)}
      className={`p-4 rounded-xl shadow text-white transition ${styles[slot.status]}`}
    >
      <p className="font-semibold">{slot.time}</p>

      <p className="text-sm mt-1 capitalize">
        {slot.status === "available" && "Available"}
        {slot.status === "pending" && "Pending Approval"}
        {slot.status === "booked" && "Booked"}
        {slot.status === "disabled" && "Unavailable"}
      </p>
    </div>
  );
}