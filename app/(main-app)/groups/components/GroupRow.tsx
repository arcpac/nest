"use client";

import { Group } from "@/app/types";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { memo } from "react";
import { StatusLabel } from "./Status";


const GroupRow = memo(({ group }: { group: Group }) => {
  return (
    <tr key={group.id} className="border-b text-sm">
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <Link href={`/groups/${group.id}/view`}>
          <span className="hover:text-blue-500 hover:underline">
            {group.name}
          </span>
        </Link>
      </td>
      <td className="whitespace-nowrap px-3 py-3">email@email.com</td>
      <td className="whitespace-nowrap px-3 py-3">123</td>
      <td className="whitespace-nowrap px-3 py-3">123</td>
      <td className="whitespace-nowrap px-3 py-3">
        <StatusLabel isTrue={group.active} type="groups" />
      </td>
    </tr>
  );
});

export default GroupRow;
