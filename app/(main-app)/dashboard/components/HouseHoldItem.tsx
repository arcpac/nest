import React from "react";
import { Household } from "../types";
import { lusitana } from "@/app/ui/fonts";

const HouseHoldItem = ({ household }: { household: Household }) => {
  return (
    <>
      <div className="flex items-center">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold md:text-base">
            {household.name}
          </p>
          <p className="hidden text-sm text-gray-500 sm:block">Members: 5 </p>
        </div>
      </div>
      <p
        className={`${lusitana.className} truncate text-sm font-medium md:text-base`}
      >
        {household.active ? "Active" : "Inactive"}
      </p>
    </>
  );
};

export default HouseHoldItem;
