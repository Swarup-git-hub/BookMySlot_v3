// // import React from "react";
// import SlotCard from "./SlotCard";
// export default function SlotSection({title,slots,onClick}){
//   return (
//     <div className="mb-6">
//       <h2 className="font-bold mb-3">{title}</h2>
//       <div className="grid grid-cols-5 gap-3">
//         {slots.map(s=> <SlotCard key={s.id} slot={s} onClick={onClick}/>)}
//       </div>
//     </div>
//   );
// }

import React from "react";
import SlotCard from "./SlotCard";
export default function SlotSection({ title, slots, onClick }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-3">{title}</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {slots.map((slot) => (
          <SlotCard key={slot.id} slot={slot} onClick={onClick} />
        ))}
      </div>
    </div>
  );
}