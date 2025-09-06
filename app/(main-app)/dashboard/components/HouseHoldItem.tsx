import React from "react";
import Link from "next/link";
import { Household } from "../types";

// const HouseHoldItem = ({ household }: { household: Household }) => {
//   return (
//     <li key={household.id} className="border p-4 rounded shadow-sm">
//       <Link href={`/household/${household.id}`}>
//         <div className="text-lg font-semibold hover:underline">
//           {household.name}
//         </div>
//       </Link>
//     </li>
//   );
// };

const HouseHoldItem = ({ household }: { household: Household }) => {
  return (
    <li
      key={household.id}
      className="rounded-xl border p-4 transition bg-white"
    >
      <Link href={`/household/${household.id}`}>
        <div className="flex flex-col space-y-2">
          {/* Currency */}
          <div className="text-lg font-semibold text-gray-600">
            {household.name}
          </div>
          <div className="text-sm text-gray-400">Editable name</div>

          <div className="mt-2 inline-flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            <span className="text-xs text-gray-500 px-2 py-1 rounded-md border">
              Active
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default HouseHoldItem;
