import React from "react";
import { getUserGroups } from "../lib/groups";
import { lusitana } from "@/app/ui/fonts";
import clsx from "clsx";
import HouseHoldItem from "./HouseHoldItem";

const HouseHoldList = async () => {
  const households = await getUserGroups();
  if (!households || households.length === 0) {
    return <div>No households found</div>;
  }
  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Your Groups
      </h2>
      <div className="flex justify-between flex-col rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {households.map((hh, i) => {
            return (
              <div
                key={i}
                className={clsx(
                  "flex flex-row items-center justify-between py-4",
                  {
                    "border-t": i !== 0,
                  }
                )}
              >
                <HouseHoldItem household={hh} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HouseHoldList;
