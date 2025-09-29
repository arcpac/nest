"use client";

import { Trash } from "lucide-react";
import GroupRow from "./GroupRow";
import { Group } from "@/app/types";
import { useMemo, useState } from "react";

function GroupsTable({ groups }: { groups: Group[] }) {
  const [count, setCount] = useState(0);
  const stableGroups = useMemo(() => groups, [groups]);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {groups?.map((group) => (
              <div
                key={group.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <p>{group.name}</p>
                    </div>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">123</p>
                    <p>123</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Trash />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Your groups
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {stableGroups?.map((group, i) => (
                <GroupRow key={i} group={group} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GroupsTable;
