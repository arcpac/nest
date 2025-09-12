"use client";

import { useEffect } from "react";
import { PencilIcon, Trash } from "lucide-react";
import { useHouseholds } from "@/app/store/householdStore";
import { Household } from "../../types";

export default function HouseHoldClientTable({
  households,
}: {
  households: Household[];
}) {
  const householdsList = useHouseholds();

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th className="px-4 py-5 font-medium sm:pl-6">Household</th>
                <th className="px-3 py-5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {householdsList?.map((hh) => (
                <tr key={hh.id} className="border-b text-sm">
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {hh.name}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex gap-3">
                      <PencilIcon />
                      <Trash />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
