import { getHouseholdId } from "@/app/(main-app)/dashboard/lib/houseHold";
import { lusitana } from "@/app/ui/fonts";
import Link from "next/link";
import React from "react";

const HouseHoldWrapper = async ({ houseHoldId }: { houseHoldId: string }) => {
  const household = await getHouseholdId(houseHoldId);
  const members = [1, 2, 3, 4, 5];
  return (
    <div>
      {/* Household Header */}
      <div className="flex flex-row justify-start items-center mb-3">
        <h1 className={`text-2xl font-bold text-neutral-500 ${lusitana.className}`}>
          {household.name}{" "}
        </h1>
        <div className="text-md m-4 rounded-full text-neutral-500">
          {members.length} members
        </div>
      </div>

      {/* Members Grid */}
      <div className="rounded-lg">
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {members.map((member, i) => (
            <li key={i} className="rounded-xl border p-4 transition bg-white">
              <Link href={`/household/${household.id}`}>
                <div className="flex flex-col space-y-2">
                  <div className="text-sm text-gray-400">
                    Member {member} name
                  </div>
                  <div className="text-3xl text-neutral-500 font-semibold text-gray-600">
                    10.70 AUD
                  </div>
                  <div className="text-xl text-red-400 font-semibold text-gray-600">
                    15.10 AUD
                  </div>

                  <div className="mt-2 inline-flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="text-xs text-gray-500 px-2 py-1 rounded-md border">
                      Active
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HouseHoldWrapper;
