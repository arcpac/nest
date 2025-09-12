import { lusitana } from "@/app/ui/fonts";
import { members } from "@/db/schema";
import clsx from "clsx";
import { ArrowBigLeft } from "lucide-react";
import React from "react";

type MembersProps = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  household_id: string;
  joined_at: string | null;
}[];

const MembersList = ({ members }: { members: MembersProps }) => {
  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Members
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        <div className="bg-white px-6">
          {members.map((member, i) => {
            return (
              <div
                key={member.id}
                className={clsx(
                  "flex flex-row items-center justify-between py-4",
                  {
                    "border-t": i !== 0,
                  }
                )}
              >
                <div className="flex items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="hidden text-sm text-gray-500 sm:block">
                      {member.email}
                    </p>
                  </div>
                </div>
                <p
                  className={`${lusitana.className} truncate text-sm font-medium md:text-base`}
                >
                  {member.joined_at}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MembersList;
